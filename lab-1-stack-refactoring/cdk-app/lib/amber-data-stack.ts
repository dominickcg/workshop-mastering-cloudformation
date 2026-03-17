import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

interface AmberDataStackProps extends cdk.StackProps {
  participantName: string;
}

export class AmberDataStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AmberDataStackProps) {
    super(scope, id, props);

    // Tabla DynamoDB migrada desde AmberMonolithStack via Stack Refactoring
    // Descomentar este bloque en el Paso 5 del laboratorio
    // new dynamodb.Table(this, 'Table', {
    //   tableName: `amber-data-${props.participantName}`,
    //   partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
    //   removalPolicy: cdk.RemovalPolicy.RETAIN,
    // });
  }
}
