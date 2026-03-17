import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

interface AmberMonolithStackProps extends cdk.StackProps {
  participantName: string;
}

export class AmberMonolithStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AmberMonolithStackProps) {
    super(scope, id, props);

    // Tabla DynamoDB - En el Paso 5 del laboratorio, debe comentar este bloque
    // y descomentarlo en amber-data-stack.ts para mover la tabla al nuevo Stack
    new dynamodb.Table(this, 'Table', {
      tableName: `amber-data-${props.participantName}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Recurso placeholder para evitar que el Stack quede vacío después del Stack Refactoring
    new sns.Topic(this, 'PlaceholderTopic', {
      displayName: `amber-placeholder-${props.participantName}`,
    });
  }
}
