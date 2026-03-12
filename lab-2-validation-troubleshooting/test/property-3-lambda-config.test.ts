import * as fc from 'fast-check';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Template } from 'aws-cdk-lib/assertions';

/**
 * Property 3: Lambda Function sintetizada con configuración correcta
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.5**
 * 
 * Para cualquier nombre de participante válido, la plantilla CloudFormation sintetizada debe
 * contener un recurso `AWS::Lambda::Function` con `Runtime` igual a `nodejs20.x`, `FunctionName`
 * que incluya el nombre del participante, y `Code.ZipFile` con contenido inline.
 */

describe('Feature: validation-troubleshooting, Property 3: Lambda Function sintetizada con configuración correcta', () => {
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

  it('should generate Lambda Function with correct configuration in CloudFormation template', () => {
    fc.assert(
      fc.property(validParticipantNameArbitrary, (participantName) => {
        // Crear un Stack CDK temporal
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        // Crear una Lambda Function con código inline
        new lambda.Function(stack, 'HelloFunction', {
          functionName: `amber-hello-${participantName}`,
          runtime: lambda.Runtime.NODEJS_20_X,
          handler: 'index.handler',
          code: lambda.Code.fromInline(`
            exports.handler = async (event) => {
              return {
                statusCode: 200,
                body: JSON.stringify({
                  message: 'Hello from Amber Workshop!',
                  participant: '${participantName}',
                  timestamp: new Date().toISOString(),
                }),
              };
            };
          `),
          timeout: cdk.Duration.seconds(10),
          memorySize: 128,
        });

        // Sintetizar la plantilla CloudFormation
        const template = Template.fromStack(stack);

        // Verificar que existe un recurso AWS::Lambda::Function
        template.resourceCountIs('AWS::Lambda::Function', 1);

        // Verificar que el recurso tiene las propiedades correctas
        template.hasResourceProperties('AWS::Lambda::Function', {
          FunctionName: `amber-hello-${participantName}`,
          Runtime: 'nodejs20.x',
        });

        // Obtener la plantilla completa como JSON para verificar Code.ZipFile
        const templateJson = template.toJSON();
        const resources = templateJson.Resources;
        const lambdaResource = Object.values(resources).find(
          (resource: any) => resource.Type === 'AWS::Lambda::Function'
        ) as any;

        // Verificar que el recurso existe
        expect(lambdaResource).toBeDefined();
        expect(lambdaResource.Properties).toBeDefined();

        // Verificar que tiene código inline (Code.ZipFile)
        expect(lambdaResource.Properties.Code).toBeDefined();
        expect(lambdaResource.Properties.Code.ZipFile).toBeDefined();
        expect(typeof lambdaResource.Properties.Code.ZipFile).toBe('string');
        expect(lambdaResource.Properties.Code.ZipFile.length).toBeGreaterThan(0);

        // Verificar que el código inline contiene el nombre del participante
        expect(lambdaResource.Properties.Code.ZipFile).toContain(participantName);
      }),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });
});
