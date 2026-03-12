import * as fc from 'fast-check';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Template } from 'aws-cdk-lib/assertions';

/**
 * Property 1: S3 Bucket con nombre explícito genera BucketName en plantilla
 * 
 * **Validates: Requirements 2.1**
 * 
 * Para cualquier nombre de bucket válido proporcionado como `bucketName` en el constructor
 * `s3.Bucket`, la plantilla CloudFormation sintetizada por CDK debe contener un recurso
 * `AWS::S3::Bucket` con la propiedad `BucketName` igual al nombre proporcionado.
 */

describe('Feature: validation-troubleshooting, Property 1: S3 Bucket con nombre explícito genera BucketName en plantilla', () => {
  /**
   * Generador de nombres de bucket S3 válidos
   * 
   * Reglas de nombres de bucket S3:
   * - Entre 3 y 63 caracteres
   * - Solo letras minúsculas, números y guiones
   * - Debe comenzar y terminar con letra o número
   * - No puede contener guiones consecutivos
   * - No puede tener formato de dirección IP (e.g., 192.168.1.1)
   */
  const validBucketNameArbitrary = fc
    .stringMatching(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/)
    .filter((name) => {
      // Filtrar nombres que contengan guiones consecutivos
      if (name.includes('--')) return false;
      
      // Filtrar nombres que parezcan direcciones IP
      if (/^\d+\.\d+\.\d+\.\d+$/.test(name)) return false;
      
      return true;
    });

  it('should generate BucketName property in CloudFormation template when explicit bucketName is provided', () => {
    fc.assert(
      fc.property(validBucketNameArbitrary, (bucketName) => {
        // Crear un Stack CDK temporal
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        // Crear un S3 Bucket con nombre explícito
        new s3.Bucket(stack, 'TestBucket', {
          bucketName: bucketName,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Sintetizar la plantilla CloudFormation
        const template = Template.fromStack(stack);

        // Verificar que existe un recurso AWS::S3::Bucket
        template.resourceCountIs('AWS::S3::Bucket', 1);

        // Verificar que el recurso tiene la propiedad BucketName con el valor correcto
        template.hasResourceProperties('AWS::S3::Bucket', {
          BucketName: bucketName,
        });
      }),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });
});
