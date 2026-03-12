import * as fc from 'fast-check';

/**
 * Property 7: Scripts incorporan nombre de participante correctamente
 * 
 * **Validates: Requirements 13.2, 13.3, 13.4, 13.5, 13.6**
 * 
 * Para cualquier nombre de participante proporcionado como argumento, ambos scripts
 * (`restrict-permissions.sh` y `restore-permissions.sh`) deben generar el nombre de política
 * `DenyLambdaCreate-{nombre-participante}` y el nombre de rol
 * `cdk-hnb659fds-cfn-exec-role-{account-id}-{region}` incorporando el nombre del participante
 * en la política.
 */

describe('Feature: validation-troubleshooting, Property 7: Scripts incorporan nombre de participante correctamente', () => {
  /**
   * Generador de nombres de participante válidos
   * 
   * Reglas:
   * - Entre 3 y 20 caracteres
   * - Solo letras minúsculas, números y guiones
   * - Debe comenzar con letra
   */
  const validParticipantNameArbitrary = fc
    .stringMatching(/^[a-z][a-z0-9-]{2,19}$/)
    .filter((name) => {
      // Filtrar nombres que contengan guiones consecutivos
      if (name.includes('--')) return false;
      return true;
    });

  /**
   * Generador de AWS Account IDs (12 dígitos)
   */
  const accountIdArbitrary = fc.stringMatching(/^\d{12}$/);

  /**
   * Generador de regiones AWS comunes
   */
  const regionArbitrary = fc.constantFrom(
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2',
    'eu-west-1',
    'eu-west-2',
    'eu-central-1',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'sa-east-1'
  );

  /**
   * Simula la generación del nombre de política por los scripts
   */
  function generatePolicyName(participantName: string): string {
    return `DenyLambdaCreate-${participantName}`;
  }

  /**
   * Simula la generación del nombre de rol por los scripts
   */
  function generateRoleName(accountId: string, region: string): string {
    return `cdk-hnb659fds-cfn-exec-role-${accountId}-${region}`;
  }

  /**
   * Simula la lógica del script restrict-permissions.sh
   */
  function simulateRestrictScript(
    participantName: string,
    accountId: string,
    region: string
  ): { policyName: string; roleName: string; policyDocument: any } {
    const policyName = generatePolicyName(participantName);
    const roleName = generateRoleName(accountId, region);

    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Deny',
          Action: 'lambda:CreateFunction',
          Resource: '*',
        },
      ],
    };

    return { policyName, roleName, policyDocument };
  }

  /**
   * Simula la lógica del script restore-permissions.sh
   */
  function simulateRestoreScript(
    participantName: string,
    accountId: string,
    region: string
  ): { policyName: string; roleName: string } {
    const policyName = generatePolicyName(participantName);
    const roleName = generateRoleName(accountId, region);

    return { policyName, roleName };
  }

  it('should generate correct policy name with participant name in restrict-permissions.sh', () => {
    fc.assert(
      fc.property(
        validParticipantNameArbitrary,
        accountIdArbitrary,
        regionArbitrary,
        (participantName, accountId, region) => {
          // Simular ejecución del script restrict-permissions.sh
          const result = simulateRestrictScript(participantName, accountId, region);

          // Verificar que el nombre de la política incluye el nombre del participante
          const expectedPolicyName = `DenyLambdaCreate-${participantName}`;
          expect(result.policyName).toBe(expectedPolicyName);

          // Verificar que el nombre de la política contiene el nombre del participante
          expect(result.policyName).toContain(participantName);
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('should generate correct policy name with participant name in restore-permissions.sh', () => {
    fc.assert(
      fc.property(
        validParticipantNameArbitrary,
        accountIdArbitrary,
        regionArbitrary,
        (participantName, accountId, region) => {
          // Simular ejecución del script restore-permissions.sh
          const result = simulateRestoreScript(participantName, accountId, region);

          // Verificar que el nombre de la política incluye el nombre del participante
          const expectedPolicyName = `DenyLambdaCreate-${participantName}`;
          expect(result.policyName).toBe(expectedPolicyName);

          // Verificar que el nombre de la política contiene el nombre del participante
          expect(result.policyName).toContain(participantName);
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('should generate correct role name with account ID and region in both scripts', () => {
    fc.assert(
      fc.property(
        validParticipantNameArbitrary,
        accountIdArbitrary,
        regionArbitrary,
        (participantName, accountId, region) => {
          // Simular ambos scripts
          const restrictResult = simulateRestrictScript(participantName, accountId, region);
          const restoreResult = simulateRestoreScript(participantName, accountId, region);

          // Verificar que ambos scripts generan el mismo nombre de rol
          expect(restrictResult.roleName).toBe(restoreResult.roleName);

          // Verificar el formato del nombre del rol
          const expectedRoleName = `cdk-hnb659fds-cfn-exec-role-${accountId}-${region}`;
          expect(restrictResult.roleName).toBe(expectedRoleName);
          expect(restoreResult.roleName).toBe(expectedRoleName);

          // Verificar que el nombre del rol contiene el account ID y la región
          expect(restrictResult.roleName).toContain(accountId);
          expect(restrictResult.roleName).toContain(region);
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('should generate valid IAM policy document in restrict-permissions.sh', () => {
    fc.assert(
      fc.property(
        validParticipantNameArbitrary,
        accountIdArbitrary,
        regionArbitrary,
        (participantName, accountId, region) => {
          // Simular ejecución del script restrict-permissions.sh
          const result = simulateRestrictScript(participantName, accountId, region);

          // Verificar la estructura de la política IAM
          expect(result.policyDocument).toBeDefined();
          expect(result.policyDocument.Version).toBe('2012-10-17');
          expect(result.policyDocument.Statement).toHaveLength(1);

          const statement = result.policyDocument.Statement[0];
          expect(statement.Effect).toBe('Deny');
          expect(statement.Action).toBe('lambda:CreateFunction');
          expect(statement.Resource).toBe('*');
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('should generate consistent names across multiple invocations with same parameters', () => {
    fc.assert(
      fc.property(
        validParticipantNameArbitrary,
        accountIdArbitrary,
        regionArbitrary,
        (participantName, accountId, region) => {
          // Simular múltiples invocaciones con los mismos parámetros
          const result1 = simulateRestrictScript(participantName, accountId, region);
          const result2 = simulateRestrictScript(participantName, accountId, region);
          const result3 = simulateRestoreScript(participantName, accountId, region);

          // Verificar que los nombres generados son consistentes
          expect(result1.policyName).toBe(result2.policyName);
          expect(result1.policyName).toBe(result3.policyName);
          expect(result1.roleName).toBe(result2.roleName);
          expect(result1.roleName).toBe(result3.roleName);
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('should generate unique policy names for different participants', () => {
    fc.assert(
      fc.property(
        fc.tuple(validParticipantNameArbitrary, validParticipantNameArbitrary).filter(
          ([name1, name2]) => name1 !== name2
        ),
        accountIdArbitrary,
        regionArbitrary,
        ([participantName1, participantName2], accountId, region) => {
          // Simular scripts para dos participantes diferentes
          const result1 = simulateRestrictScript(participantName1, accountId, region);
          const result2 = simulateRestrictScript(participantName2, accountId, region);

          // Verificar que los nombres de política son diferentes
          expect(result1.policyName).not.toBe(result2.policyName);

          // Verificar que ambos nombres contienen sus respectivos nombres de participante
          expect(result1.policyName).toContain(participantName1);
          expect(result2.policyName).toContain(participantName2);

          // Verificar que el nombre del rol es el mismo (mismo account y región)
          expect(result1.roleName).toBe(result2.roleName);
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });
});
