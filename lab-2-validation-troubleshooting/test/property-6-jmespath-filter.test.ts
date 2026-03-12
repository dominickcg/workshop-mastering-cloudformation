import * as fc from 'fast-check';

/**
 * Property 6: Filtro JMESPath aísla eventos fallidos
 * 
 * **Validates: Requirements 7.2, 7.3**
 * 
 * Para cualquier conjunto de Stack Events con mezcla de estados (`CREATE_COMPLETE`,
 * `CREATE_IN_PROGRESS`, `CREATE_FAILED`, `UPDATE_FAILED`, `DELETE_COMPLETE`), aplicar el filtro
 * `StackEvents[?ResourceStatus=='CREATE_FAILED' || ResourceStatus=='UPDATE_FAILED']` debe
 * retornar únicamente los eventos con estado `CREATE_FAILED` o `UPDATE_FAILED`, sin incluir
 * eventos de otros estados.
 */

describe('Feature: validation-troubleshooting, Property 6: Filtro JMESPath aísla eventos fallidos', () => {
  /**
   * Tipos de estados de recursos de CloudFormation
   */
  type ResourceStatus =
    | 'CREATE_IN_PROGRESS'
    | 'CREATE_COMPLETE'
    | 'CREATE_FAILED'
    | 'UPDATE_IN_PROGRESS'
    | 'UPDATE_COMPLETE'
    | 'UPDATE_FAILED'
    | 'DELETE_IN_PROGRESS'
    | 'DELETE_COMPLETE'
    | 'DELETE_FAILED'
    | 'ROLLBACK_IN_PROGRESS'
    | 'ROLLBACK_COMPLETE'
    | 'ROLLBACK_FAILED';

  /**
   * Estructura de un evento de Stack de CloudFormation
   */
  interface StackEvent {
    EventId: string;
    StackName: string;
    LogicalResourceId: string;
    ResourceType: string;
    ResourceStatus: ResourceStatus;
    ResourceStatusReason?: string;
    Timestamp: string;
  }

  /**
   * Implementación de la lógica del filtro JMESPath
   * 
   * Simula: StackEvents[?ResourceStatus=='CREATE_FAILED' || ResourceStatus=='UPDATE_FAILED']
   */
  function applyJMESPathFilter(events: StackEvent[]): StackEvent[] {
    return events.filter(
      (event) =>
        event.ResourceStatus === 'CREATE_FAILED' ||
        event.ResourceStatus === 'UPDATE_FAILED'
    );
  }

  /**
   * Generador de estados de recursos aleatorios
   */
  const resourceStatusArbitrary = fc.constantFrom<ResourceStatus>(
    'CREATE_IN_PROGRESS',
    'CREATE_COMPLETE',
    'CREATE_FAILED',
    'UPDATE_IN_PROGRESS',
    'UPDATE_COMPLETE',
    'UPDATE_FAILED',
    'DELETE_IN_PROGRESS',
    'DELETE_COMPLETE',
    'DELETE_FAILED',
    'ROLLBACK_IN_PROGRESS',
    'ROLLBACK_COMPLETE',
    'ROLLBACK_FAILED'
  );

  /**
   * Generador de eventos de Stack aleatorios
   */
  const stackEventArbitrary = fc.record({
    EventId: fc.uuid(),
    StackName: fc.stringMatching(/^[A-Za-z][A-Za-z0-9-]{2,127}$/),
    LogicalResourceId: fc.stringMatching(/^[A-Za-z][A-Za-z0-9]{2,63}$/),
    ResourceType: fc.constantFrom(
      'AWS::S3::Bucket',
      'AWS::Lambda::Function',
      'AWS::DynamoDB::Table',
      'AWS::IAM::Role',
      'AWS::EC2::Instance'
    ),
    ResourceStatus: resourceStatusArbitrary,
    ResourceStatusReason: fc.option(fc.string(), { nil: undefined }),
    Timestamp: fc.date().map((d) => d.toISOString()),
  });

  /**
   * Generador de arrays de eventos de Stack
   */
  const stackEventsArrayArbitrary = fc.array(stackEventArbitrary, {
    minLength: 1,
    maxLength: 50,
  });

  it('should filter only CREATE_FAILED and UPDATE_FAILED events', () => {
    fc.assert(
      fc.property(stackEventsArrayArbitrary, (events) => {
        // Aplicar el filtro JMESPath
        const filteredEvents = applyJMESPathFilter(events);

        // Verificar que todos los eventos filtrados tienen estado CREATE_FAILED o UPDATE_FAILED
        filteredEvents.forEach((event) => {
          expect(
            event.ResourceStatus === 'CREATE_FAILED' ||
              event.ResourceStatus === 'UPDATE_FAILED'
          ).toBe(true);
        });

        // Verificar que no se perdieron eventos con estado CREATE_FAILED o UPDATE_FAILED
        const expectedFailedEvents = events.filter(
          (event) =>
            event.ResourceStatus === 'CREATE_FAILED' ||
            event.ResourceStatus === 'UPDATE_FAILED'
        );

        expect(filteredEvents.length).toBe(expectedFailedEvents.length);
      }),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('should exclude all non-failed events', () => {
    fc.assert(
      fc.property(stackEventsArrayArbitrary, (events) => {
        // Aplicar el filtro JMESPath
        const filteredEvents = applyJMESPathFilter(events);

        // Verificar que ningún evento con otros estados está incluido
        const excludedStatuses: ResourceStatus[] = [
          'CREATE_IN_PROGRESS',
          'CREATE_COMPLETE',
          'UPDATE_IN_PROGRESS',
          'UPDATE_COMPLETE',
          'DELETE_IN_PROGRESS',
          'DELETE_COMPLETE',
          'DELETE_FAILED',
          'ROLLBACK_IN_PROGRESS',
          'ROLLBACK_COMPLETE',
          'ROLLBACK_FAILED',
        ];

        filteredEvents.forEach((event) => {
          expect(excludedStatuses).not.toContain(event.ResourceStatus);
        });
      }),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('should return empty array when no failed events exist', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            EventId: fc.uuid(),
            StackName: fc.string(),
            LogicalResourceId: fc.string(),
            ResourceType: fc.string(),
            ResourceStatus: fc.constantFrom<ResourceStatus>(
              'CREATE_IN_PROGRESS',
              'CREATE_COMPLETE',
              'UPDATE_IN_PROGRESS',
              'UPDATE_COMPLETE',
              'DELETE_COMPLETE'
            ),
            Timestamp: fc.date().map((d) => d.toISOString()),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (events) => {
          // Aplicar el filtro JMESPath
          const filteredEvents = applyJMESPathFilter(events);

          // Verificar que el resultado está vacío
          expect(filteredEvents.length).toBe(0);
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('should return all events when all are failed', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            EventId: fc.uuid(),
            StackName: fc.string(),
            LogicalResourceId: fc.string(),
            ResourceType: fc.string(),
            ResourceStatus: fc.constantFrom<ResourceStatus>(
              'CREATE_FAILED',
              'UPDATE_FAILED'
            ),
            Timestamp: fc.date().map((d) => d.toISOString()),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (events) => {
          // Aplicar el filtro JMESPath
          const filteredEvents = applyJMESPathFilter(events);

          // Verificar que todos los eventos están incluidos
          expect(filteredEvents.length).toBe(events.length);
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });
});
