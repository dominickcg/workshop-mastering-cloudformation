# AWS Documentation Validation Report - Laboratorio 2

**Fecha de validación**: 2024
**Spec**: validation-troubleshooting
**Sección**: 8. Validación con AWS Documentation

## Resumen Ejecutivo

Se validaron todos los comandos CLI, sintaxis CDK, y permisos IAM del Laboratorio 2 contra la documentación oficial de AWS. Se identificaron **discrepancias críticas** que requieren corrección en el README.md.

---

## 8.1 ✅ Validación de Early Validation

**Estado**: VALIDADO - Funcionalidad existe oficialmente

**Documentación oficial**:
- URL: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/validate-stack-deployments.html
- Título: "Validate stack deployments - AWS CloudFormation"

**Hallazgos**:
- ✅ La funcionalidad "Early Validation" existe oficialmente bajo el nombre **"Pre-deployment validation"**
- ✅ Valida plantillas durante la creación del Change Set antes del aprovisionamiento
- ✅ Detecta errores de sintaxis de propiedades, conflictos de nombres de recursos, y validación de vaciado de buckets S3
- ✅ Tiene dos modos: FAIL (bloquea ejecución) y WARN (permite ejecución con advertencias)

**Recomendación**: El laboratorio usa el término "Early Validation" que es correcto conceptualmente, pero la documentación oficial usa "Pre-deployment validation". Considerar agregar una nota aclaratoria.

---

## 8.2 ⚠️ Validación de comando describe-stack-events con --operation-id

**Estado**: DISCREPANCIA CRÍTICA - Comando incorrecto

**Problema identificado**:
El README.md usa `describe-stack-events --operation-id` pero este comando **NO soporta** el parámetro `--operation-id`.

**Comando correcto**:
```bash
aws cloudformation describe-events --operation-id <OPERATION_ID>
```

**Documentación oficial**:
- URL: https://docs.aws.amazon.com/cli/v1/reference/cloudformation/describe-events.html
- Título: "describe-events — AWS CLI Command Reference"

**Diferencias entre comandos**:

| Característica | describe-stack-events | describe-events |
|----------------|----------------------|-----------------|
| Parámetro --operation-id | ❌ NO soportado | ✅ Soportado |
| Filtro FailedEvents | ❌ NO soportado | ✅ Soportado (--filter FailedEvents=true) |
| Agrupación por operación | ❌ NO | ✅ SÍ |
| Uso recomendado | Eventos históricos generales | Troubleshooting por operación específica |

**Sintaxis correcta del comando**:
```bash
# Comando básico con operation-id
aws cloudformation describe-events \
  --operation-id <OPERATION_ID>

# Con filtro de eventos fallidos (recomendado)
aws cloudformation describe-events \
  --operation-id <OPERATION_ID> \
  --filter FailedEvents=true
```

**Ubicaciones en README.md que requieren corrección**:
1. Paso 9: Título de la sección
2. Paso 9: Comando de ejemplo (línea ~350)
3. Paso 9: Comando con filtro JMESPath (línea ~360)

**Acción requerida**: CRÍTICO - Reemplazar todos los usos de `describe-stack-events` por `describe-events` en el Paso 9.

---

## 8.3 ✅ Validación de campo LastOperations en describe-stacks

**Estado**: VALIDADO - Campo existe oficialmente

**Documentación oficial**:
- URL: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/view-stack-events-by-operation.html
- Título: "View stack events by operation - AWS CloudFormation"

**Hallazgos**:
- ✅ El campo `LastOperations` existe en la respuesta de `describe-stacks`
- ✅ Estructura correcta: `LastOperations[0].OperationId` (UUID)
- ✅ Incluye también `OperationType` (CREATE_STACK, UPDATE_STACK, ROLLBACK, etc.)

**Ejemplo de respuesta oficial**:
```json
{
  "Stacks": [{
    "LastOperations": [
      {
        "OperationType": "ROLLBACK",
        "OperationId": "d0f12313-7bdb-414d-a879-828a99b36f29"
      },
      {
        "OperationType": "UPDATE_STACK",
        "OperationId": "1c211b5a-4538-4dc9-bfed-e07734371e57"
      }
    ]
  }]
}
```

**Recomendación**: El README.md usa correctamente este campo. No requiere cambios.

---

## 8.4 ✅ Validación de sintaxis CDK para S3 y Lambda

### S3 Bucket

**Estado**: VALIDADO - Sintaxis correcta

**Documentación oficial**:
- URL: https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-s3.Bucket.html
- Módulo: `@aws-cdk/aws-s3` (CDK v1) o `aws-cdk-lib/aws-s3` (CDK v2)

**Propiedades validadas**:
- ✅ `bucketName?: string` - Nombre físico del bucket (opcional)
- ✅ `removalPolicy?: RemovalPolicy` - Política de eliminación (DESTROY, RETAIN, SNAPSHOT)
- ✅ `autoDeleteObjects?: boolean` - Elimina objetos automáticamente al destruir el bucket

**Sintaxis del README.md**: ✅ CORRECTA

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

new s3.Bucket(this, 'Bucket', {
  bucketName: 'amber-workshop-bucket',  // ✅ Válido
  removalPolicy: cdk.RemovalPolicy.DESTROY,  // ✅ Válido
  autoDeleteObjects: true,  // ✅ Válido
});
```

### Lambda Function

**Estado**: VALIDADO - Sintaxis correcta

**Documentación oficial**:
- URL: https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.Function.html
- URL Runtime: https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html
- Módulo: `@aws-cdk/aws-lambda` (CDK v1) o `aws-cdk-lib/aws-lambda` (CDK v2)

**Propiedades validadas**:
- ✅ `functionName?: string` - Nombre de la función
- ✅ `runtime: Runtime` - Entorno de ejecución
- ✅ `handler: string` - Método de entrada (ej: "index.handler")
- ✅ `code: Code` - Código fuente de la función
- ✅ `timeout?: Duration` - Tiempo máximo de ejecución
- ✅ `memorySize?: number` - Memoria asignada en MB

**Runtime Node.js 20 validado**:
- ✅ Identificador oficial: `nodejs20.x`
- ✅ Sistema operativo: Amazon Linux 2023
- ✅ Fecha de deprecación: 30 de abril de 2026
- ✅ CDK constant: `lambda.Runtime.NODEJS_20_X` ✅ VÁLIDO

**Sintaxis del README.md**: ✅ CORRECTA

```typescript
import * as lambda from 'aws-cdk-lib/aws-lambda';

new lambda.Function(this, 'HelloFunction', {
  functionName: `amber-hello-${props.participantName}`,  // ✅ Válido
  runtime: lambda.Runtime.NODEJS_20_X,  // ✅ Válido (nodejs20.x)
  handler: 'index.handler',  // ✅ Válido
  code: lambda.Code.fromInline(`...`),  // ✅ Válido
  timeout: cdk.Duration.seconds(10),  // ✅ Válido
  memorySize: 128,  // ✅ Válido
});
```

---

## 8.5 ✅ Validación de permisos IAM para Lambda

**Estado**: VALIDADO - Permiso correcto

**Documentación oficial**:
- URL: https://docs.aws.amazon.com/lambda/latest/dg/access-control-identity-based.html
- Título: "Identity-based IAM policies for Lambda"

**Hallazgos**:
- ✅ `lambda:CreateFunction` es el permiso correcto para crear funciones Lambda
- ✅ Sintaxis de política de denegación (`Effect: Deny`) es correcta
- ✅ Una política `Deny` explícita siempre prevalece sobre `Allow` (comportamiento validado)

**Política IAM del script validada**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",  // ✅ Válido
      "Action": "lambda:CreateFunction",  // ✅ Válido
      "Resource": "*"  // ✅ Válido
    }
  ]
}
```

**Recomendación**: La política IAM en los scripts es correcta. No requiere cambios.

---

## 8.6 📝 Actualización de documentación con hallazgos

### Cambios requeridos en README.md

#### CRÍTICO - Paso 9: Reemplazar describe-stack-events por describe-events

**Ubicación**: Paso 9 - Troubleshooting con Operation ID

**Cambio 1 - Comando básico**:
```diff
- aws cloudformation describe-stack-events \
+ aws cloudformation describe-events \
    --stack-name AmberMonolithStack-{nombre-participante} \
    --operation-id <OPERATION_ID>
```

**Cambio 2 - Comando con filtro**:

Opción A - Usar filtro nativo (RECOMENDADO):
```bash
aws cloudformation describe-events \
  --stack-name AmberMonolithStack-{nombre-participante} \
  --operation-id <OPERATION_ID> \
  --filter FailedEvents=true
```

Opción B - Mantener filtro JMESPath (alternativa):
```bash
aws cloudformation describe-events \
  --stack-name AmberMonolithStack-{nombre-participante} \
  --operation-id <OPERATION_ID> \
  --query "OperationEvents[?ResourceStatus=='CREATE_FAILED' || ResourceStatus=='UPDATE_FAILED'].[LogicalResourceId,ResourceType,ResourceStatus,ResourceStatusReason]" \
  --output table
```

**Nota importante**: El campo de salida cambia de `StackEvents` a `OperationEvents` cuando se usa `describe-events`.

**Cambio 3 - Actualizar explicación**:
```markdown
**Concepto clave**: El comando `describe-events` con **Operation ID** permite realizar 
troubleshooting quirúrgico, filtrando únicamente los eventos de una operación específica 
sin necesidad de revisar el historial completo del Stack. El parámetro `--filter FailedEvents=true` 
aísla automáticamente solo los eventos fallidos.
```

### Referencias a documentación oficial agregadas

Se recomienda agregar comentarios en el código CDK del README.md con referencias a documentación:

```typescript
// Referencia: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3.Bucket.html
import * as s3 from 'aws-cdk-lib/aws-s3';

// Referencia: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda.Function.html
// Runtime Node.js 20: https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html
import * as lambda from 'aws-cdk-lib/aws-lambda';
```

### Comentarios en scripts IAM

Se recomienda agregar comentarios en los scripts con referencias:

```bash
#!/bin/bash
# restrict-permissions.sh
# Referencia IAM Deny policies: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_effect.html
# Referencia lambda:CreateFunction: https://docs.aws.amazon.com/lambda/latest/dg/access-control-identity-based.html
```

---

## Resumen de Acciones Requeridas

### Prioridad CRÍTICA
1. ✅ **Reemplazar `describe-stack-events` por `describe-events` en Paso 9**
   - Afecta: 3 ubicaciones en README.md
   - Impacto: El comando actual NO funcionará con --operation-id

### Prioridad MEDIA
2. ⚠️ **Actualizar campo de salida de `StackEvents` a `OperationEvents`**
   - Afecta: Filtro JMESPath en Paso 9
   - Impacto: El filtro actual fallará con el comando correcto

3. ⚠️ **Considerar usar `--filter FailedEvents=true` en lugar de JMESPath**
   - Afecta: Paso 9
   - Beneficio: Sintaxis más simple y nativa del comando

### Prioridad BAJA
4. ℹ️ **Agregar nota sobre "Pre-deployment validation" vs "Early Validation"**
   - Afecta: Introducción del laboratorio
   - Beneficio: Claridad terminológica

5. ℹ️ **Agregar comentarios con URLs de documentación oficial**
   - Afecta: Código CDK y scripts
   - Beneficio: Referencia rápida para participantes

---

## Conclusión

La validación identificó una **discrepancia crítica** en el comando CLI usado para troubleshooting con Operation ID. El resto de la sintaxis CDK, permisos IAM, y conceptos de CloudFormation están correctamente documentados y alineados con la documentación oficial de AWS.

**Acción inmediata requerida**: Corregir el Paso 9 del README.md antes de que los participantes ejecuten el laboratorio.

---

**Validado por**: Kiro AI Agent
**Herramienta**: AWS Documentation MCP Server
**Fecha**: 2024
