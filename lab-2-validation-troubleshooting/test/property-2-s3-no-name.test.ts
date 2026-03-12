import * as fc from 'fast-check';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Template } from 'aws-cdk-lib/assertions';

/**
 * Property 2: S3 Bucket sin nombre explícito omite BucketName en plantilla
 * 
 * **Validates: Requirements 3.1, 3.3**
 * 
 * Para cualquier instancia de `s3.Bucket` creada sin la propiedad `bucketName`, la plantilla
 * CloudFormation sintetizada por CDK debe contener un recurso `AWS::S3::Bucket` que NO incluya
 * la propiedad `BucketName`.
 */

describe('Feature: validation-troubleshooting, Property 2: S3 Bucket sin nombre explícito omite BucketName en plantilla', () => {
  /**
   * Esta es una propiedad estructural que no requiere generación de inputs variables.
   * Sin embargo, ejecutamos múltiples iteraciones para asegurar consistencia del comportamiento.
   * 
   * Cada iteración crea un nuevo Stack y verifica que la plantilla sintetizada no contiene
   * la propiedad BucketName cuando no se especifica explícitamente.
   */
  it('should NOT generate BucketName property in CloudFormation template when bucketName is omitted', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        // Crear un Stack CDK temporal
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        // Crear un S3 Bucket SIN nombre explícito
        new s3.Bucket(stack, 'TestBucket', {
          removalPolicy: cdk.RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        });

        // Sintetizar la plantilla CloudFormation
        const template = Template.fromStack(stack);

        // Verificar que existe un recurso AWS::S3::Bucket
        template.resourceCountIs('AWS::S3::Bucket', 1);

        // Obtener la plantilla completa como JSON
        const templateJson = template.toJSON();
        
        // Buscar el recurso S3 Bucket en la plantilla
        const resources = templateJson.Resources;
        const bucketResource = Object.values(resources).find(
          (resource: any) => resource.Type === 'AWS::S3::Bucket'
        ) as any;

        // Verificar que el recurso existe
        expect(bucketResource).toBeDefined();

        // Verificar que NO tiene la propiedad BucketName
        expect(bucketResource.Properties).toBeDefined();
        expect(bucketResource.Properties.BucketName).toBeUndefined();
      }),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });
});
