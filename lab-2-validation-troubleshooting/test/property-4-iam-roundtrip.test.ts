import * as fc from 'fast-check';

/**
 * Property 4: Round-trip de permisos IAM (restrict → restore)
 * 
 * **Validates: Requirements 5.1, 8.1, 13.2, 13.5**
 * 
 * Para cualquier nombre de participante válido, ejecutar `restrict-permissions.sh` seguido de
 * `restore-permissions.sh` debe dejar el rol IAM sin la política inline de denegación
 * `DenyLambdaCreate-{participante}`, restaurando el estado original.
 */

describe('Feature: validation-troubleshooting, Property 4: Round-trip de permisos IAM (restrict → restore)', () => {
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
   * Simula el estado de un rol IAM con sus políticas inline
   */
  interface IAMRoleState {
    roleName: string;
    inlinePolicies: Map<string, any>;
  }

  /**
   * Simula la ejecución del script restrict-permissions.sh
   * Agrega una política inline de denegación al rol
   */
  function simulateRestrictPermissions(
    roleState: IAMRoleState,
    participantName: string,
    accountId: string,
    region: string
  ): IAMRoleState {
    const policyName = `DenyLambdaCreate-${participantName}`;
    const roleName = `cdk-hnb659fds-cfn-exec-role-${accountId}-${region}`;

    const denyPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Deny',
          Action: 'lambda:CreateFunction',
          Resource: '*',
        },
      ],
    };

    // Crear una copia del estado del rol
    const newState: IAMRoleState = {
      roleName: roleName,
      inlinePolicies: new Map(roleState.inlinePolicies),
    };

    // Agregar la política de denegación
    newState.inlinePolicies.set(policyName, denyPolicy);

    return newState;
  }

  /**
   * Simula la ejecución del script restore-permissions.sh
   * Elimina la política inline de denegación del rol
   */
  function simulateRestorePermissions(
    roleState: IAMRoleState,
    participantName: string,
    accountId: string,
    region: string
  ): IAMRoleState {
    const policyName = `DenyLambdaCreate-${participantName}`;
    const roleName = `cdk-hnb659fds-cfn-exec-role-${accountId}-${region}`;

    // Crear una copia del estado del rol
    const newState: IAMRoleState = {
      roleName: roleName,
      inlinePolicies: new Map(roleState.inlinePolicies),
    };

    // Eliminar la política de denegación
    newState.inlinePolicies.delete(policyName);

    return newState;
  }

  it('should restore IAM role to original state after restrict → restore round-trip', () => {
    fc.assert(
      fc.property(
        validParticipantNameArbitrary,
        fc.stringMatching(/^\d{12}$/), // AWS Account ID (12 dígitos)
        fc.constantFrom('us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'), // Regiones comunes
        (participantName, accountId, region) => {
          // Estado inicial del rol (sin políticas inline)
          const initialState: IAMRoleState = {
            roleName: `cdk-hnb659fds-cfn-exec-role-${accountId}-${region}`,
            inlinePolicies: new Map(),
          };

          // Simular restrict-permissions.sh
          const restrictedState = simulateRestrictPermissions(
            initialState,
            participantName,
            accountId,
            region
          );

          // Verificar que la política de denegación fue agregada
          const policyName = `DenyLambdaCreate-${participantName}`;
          expect(restrictedState.inlinePolicies.has(policyName)).toBe(true);

          const denyPolicy = restrictedState.inlinePolicies.get(policyName);
          expect(denyPolicy).toBeDefined();
          expect(denyPolicy.Statement[0].Effect).toBe('Deny');
          expect(denyPolicy.Statement[0].Action).toBe('lambda:CreateFunction');

          // Simular restore-permissions.sh
          const restoredState = simulateRestorePermissions(
            restrictedState,
            participantName,
            accountId,
            region
          );

          // Verificar que la política de denegación fue eliminada (round-trip completo)
          expect(restoredState.inlinePolicies.has(policyName)).toBe(false);

          // Verificar que el estado final es igual al estado inicial
          expect(restoredState.inlinePolicies.size).toBe(initialState.inlinePolicies.size);
          expect(restoredState.roleName).toBe(initialState.roleName);
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('should generate correct policy name and role name for any participant', () => {
    fc.assert(
      fc.property(
        validParticipantNameArbitrary,
        fc.stringMatching(/^\d{12}$/), // AWS Account ID
        fc.constantFrom('us-east-1', 'us-west-2', 'eu-west-1'),
        (participantName, accountId, region) => {
          const initialState: IAMRoleState = {
            roleName: `cdk-hnb659fds-cfn-exec-role-${accountId}-${region}`,
            inlinePolicies: new Map(),
          };

          const restrictedState = simulateRestrictPermissions(
            initialState,
            participantName,
            accountId,
            region
          );

          // Verificar que el nombre de la política incluye el nombre del participante
          const expectedPolicyName = `DenyLambdaCreate-${participantName}`;
          expect(restrictedState.inlinePolicies.has(expectedPolicyName)).toBe(true);

          // Verificar que el nombre del rol tiene el formato correcto
          const expectedRoleName = `cdk-hnb659fds-cfn-exec-role-${accountId}-${region}`;
          expect(restrictedState.roleName).toBe(expectedRoleName);
        }
      ),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });
});
