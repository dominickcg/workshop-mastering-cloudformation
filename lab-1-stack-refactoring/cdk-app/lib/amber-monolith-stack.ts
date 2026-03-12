import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

interface AmberMonolithStackProps extends cdk.StackProps {
  participantName: string;
}

export class AmberMonolithStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AmberMonolithStackProps) {
    super(scope, id, props);

    // ⚠️ IMPORTANTE: Esta tabla DynamoDB fue movida a AmberDataStack
    // 
    // La tabla permanece comentada porque:
    // - Ya existe en el stack AmberDataStack desplegado en el Paso 5
    // - Descomentar causaría un conflicto de recursos duplicados
    // - NO debe descomentarse en ningún paso de este laboratorio
    //
    // La tabla existente será importada usando Fn::ImportValue en los stacks
    // que la necesiten (ver AmberComputeStack y AmberNetworkStack)
    
    // new dynamodb.Table(this, 'Table', {
    //   tableName: `amber-data-${props.participantName}`,
    //   partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
    //   removalPolicy: cdk.RemovalPolicy.RETAIN,
    // });
  }
}
