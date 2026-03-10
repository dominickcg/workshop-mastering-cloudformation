import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

interface AmberMonolithStackProps extends cdk.StackProps {
  participantName: string;
}

export class AmberMonolithStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AmberMonolithStackProps) {
    super(scope, id, props);

    // Tabla DynamoDB con RemovalPolicy.RETAIN para Stack Refactoring
    new dynamodb.Table(this, 'Table', {
      tableName: `amber-data-${props.participantName}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }
}
