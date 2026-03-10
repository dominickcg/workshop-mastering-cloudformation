# Guía de Solución de Problemas - Workshop: Mastering CloudFormation

Este documento contiene soluciones a errores comunes que pueden ocurrir durante los laboratorios del workshop.

## Índice

- [Laboratorio 1: Stack Refactoring](#laboratorio-1-stack-refactoring)
- [Laboratorio 2: SafeDeploy Hooks](#laboratorio-2-safedeploy-hooks)
- [Laboratorio 3: Validation & Troubleshooting](#laboratorio-3-validation--troubleshooting)

---

## Laboratorio 1: Stack Refactoring

### Error: Permisos IAM insuficientes

**Síntoma**: Errores `AccessDenied` o `UnauthorizedAccess` al ejecutar comandos de AWS CLI o CDK.

**Ejemplos de mensajes de error**:
```
An error occurred (AccessDenied) when calling the CreateStack operation
User: arn:aws:iam::123456789012:user/nombre is not authorized to perform: cloudformation:CreateStack
```

**Solución**:
⚠️ **Este error requiere asistencia del instructor**. Notifique al instructor de inmediato. No intente solucionar este error por su cuenta.

El instructor verificará y ajustará los permisos IAM necesarios para:
- AWS CloudFormation (CreateStack, UpdateStack, DeleteStack, ExecuteStackRefactor)
- Amazon DynamoDB (CreateTable, DescribeTable, PutItem, GetItem)

---

### Error: Sintaxis JSON inválida en refactor-mapping.json

**Síntoma**: Error al crear el Refactor Set con mensaje de JSON inválido.

**Ejemplos de mensajes de error**:
```
An error occurred (ValidationException) when calling the CreateStackRefactor operation: Invalid JSON in resource mappings
```

**Causas posibles**:
1. Falta una coma entre objetos o propiedades
2. Comillas mal cerradas
3. Corchetes o llaves desbalanceados
4. Caracteres especiales no escapados

**Solución**:

1. Valide la sintaxis JSON del archivo:
   ```bash
   cat refactor-mapping.json | python3 -c "import sys, json; json.load(sys.stdin); print('JSON válido')"
   ```

2. Si el comando anterior muestra un error, revise el archivo línea por línea:
   - Verifique que todas las comillas estén cerradas
   - Verifique que los corchetes `[]` y llaves `{}` estén balanceados
   - Verifique que no haya comas al final del último elemento de un array u objeto

3. Ejemplo de estructura correcta:
   ```json
   [
     {
       "Source": {
         "StackName": "AmberMonolithStack-luis",
         "LogicalResourceId": "TableCD117FA1"
       },
       "Destination": {
         "StackName": "AmberDataStack-luis",
         "LogicalResourceId": "TableCD117FA1"
       }
     }
   ]
   ```

---

### Error: Logical ID incorrecto en el archivo de mapeo

**Síntoma**: El Refactor Set se crea exitosamente pero falla al ejecutarse con error de recurso no encontrado.

**Ejemplos de mensajes de error**:
```
Resource with LogicalResourceId 'TableXXXXXXXX' not found in stack AmberMonolithStack-nombre
```

**Causas posibles**:
1. El Logical ID en el archivo de mapeo no coincide con el Logical ID real en la plantilla de CloudFormation
2. Se usó el placeholder de ejemplo (`TableCD117FA1`) sin reemplazarlo con el valor real

**Solución**:

1. Re-extraiga el Logical ID correcto de la plantilla sintetizada:
   ```bash
   cat cdk-app/cdk.out/AmberMonolithStack-<su-nombre>.template.json | jq -r '.Resources | to_entries[] | select(.value.Type == "AWS::DynamoDB::Table") | .key'
   ```

2. Actualice el archivo `refactor-mapping.json` con el Logical ID correcto en ambos bloques (Source y Destination).

3. Elimine el Refactor Set fallido:
   ```bash
   aws cloudformation delete-stack-refactor --stack-refactor-id <refactor-set-id>
   ```

4. Cree un nuevo Refactor Set con el archivo de mapeo corregido (repita el Paso 8 del laboratorio).

---

### Error: Estado del Refactor Set en EXECUTE_FAILED

**Síntoma**: El Refactor Set se ejecuta pero termina en estado `EXECUTE_FAILED`.

**Causas posibles**:
1. Conflicto de recursos (la tabla ya existe en el Stack de destino)
2. Plantillas de CloudFormation desactualizadas
3. Diferencias en las definiciones de recursos entre origen y destino

**Solución**:

1. Obtenga detalles del error:
   ```bash
   aws cloudformation describe-stack-refactor --stack-refactor-id <refactor-set-id>
   ```

2. Si el error indica que las plantillas están desactualizadas:
   - Ejecute `cdk synth -c participantName=<su-nombre>` nuevamente
   - Verifique que las plantillas en `cdk.out/` son las más recientes
   - Cree un nuevo Refactor Set con las plantillas actualizadas

3. Si el error indica conflicto de recursos:
   - Verifique que el Stack de destino (AmberDataStack) no existe antes de ejecutar el Refactor Set
   - Si existe, elimínelo: `aws cloudformation delete-stack --stack-name AmberDataStack-<su-nombre>`
   - Espere a que la eliminación se complete
   - Cree un nuevo Refactor Set con `--enable-stack-creation`

---

### Error: ResourceMapping is invalid

**Síntoma**: Error al crear el Refactor Set indicando que el mapeo de recursos es inválido.

**Ejemplos de mensajes de error**:
```
An error occurred (ValidationException) when calling the CreateStackRefactor operation: ResourceMapping is invalid
```

**Causas posibles**:
1. El nombre del Stack en el mapeo no coincide con el nombre real del Stack en CloudFormation
2. Falta el parámetro `--enable-stack-creation` y el Stack de destino no existe

**Solución**:

1. Verifique los nombres exactos de los Stacks:
   ```bash
   aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query 'StackSummaries[?contains(StackName, `Amber`)].StackName'
   ```

2. Asegúrese de que los nombres en `refactor-mapping.json` coinciden exactamente con los nombres mostrados.

3. Si el Stack de destino no existe, asegúrese de incluir `--enable-stack-creation` en el comando `create-stack-refactor`.

---

### Error: Límites de cuota de AWS

**Síntoma**: Error indicando que se alcanzó un límite de cuota de AWS.

**Ejemplos de mensajes de error**:
```
LimitExceededException: Account has reached the maximum number of CloudFormation stacks
```

**Solución**:
⚠️ **Este error requiere asistencia del instructor**. Notifique al instructor de inmediato.

El instructor puede:
- Solicitar un aumento de cuota a AWS
- Limpiar Stacks antiguos para liberar espacio
- Proporcionar una cuenta alternativa

---

## Laboratorio 2: SafeDeploy Hooks

_Esta sección será completada en el spec del Laboratorio 2._

---

## Laboratorio 3: Validation & Troubleshooting

_Esta sección será completada en el spec del Laboratorio 3._
