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

### Error: "Modify" action not permitted during Stack Refactoring

**Síntoma**: Error al crear el Refactor Set con mensaje indicando que se detectó una acción "Modify" no permitida.

**Ejemplos de mensajes de error**:
```
An error occurred (ValidationException) when calling the CreateStackRefactor operation: 
Found an action type that is not permitted during refactor operations: Modify
```

**Causa**: Las plantillas de CloudFormation contienen secciones adicionales (`CDKMetadata`, `Conditions`, `Parameters`, `Rules`) que CloudFormation Stack Refactoring interpreta como modificaciones no permitidas cuando se usa `--enable-stack-creation`.

**Contexto**: CloudFormation Stack Refactoring con `--enable-stack-creation` tiene restricciones estrictas sobre qué cambios son permitidos durante operaciones de refactorización. Solo permite cambios en la sección `Resources` relacionados con la migración de recursos. Cualquier cambio en `Parameters`, `Conditions`, `Rules` o recursos no relacionados con la migración (como `CDKMetadata`) causa este error.

**Solución**:

1. **Verifique que está usando plantillas limpias**: Las plantillas deben contener SOLO la sección `Resources` sin secciones adicionales.

2. **Identifique secciones problemáticas en las plantillas**:
   ```bash
   # Verificar si la plantilla contiene CDKMetadata
   cat AmberMonolithStack-<su-nombre>-clean.template.json | jq '.Resources | has("CDKMetadata")'
   
   # Verificar si la plantilla contiene Conditions
   cat AmberMonolithStack-<su-nombre>-clean.template.json | jq 'has("Conditions")'
   
   # Verificar si la plantilla contiene Parameters
   cat AmberMonolithStack-<su-nombre>-clean.template.json | jq 'has("Parameters")'
   
   # Verificar si la plantilla contiene Rules
   cat AmberMonolithStack-<su-nombre>-clean.template.json | jq 'has("Rules")'
   ```
   
   Todos los comandos anteriores deben mostrar `false`. Si alguno muestra `true`, la plantilla NO está limpia.

3. **Si las plantillas no están limpias, repita el Paso 5.5**:
   - Ejecute los scripts de limpieza (`clean-cdk-template.sh` o `clean-cdk-template.ps1`)
   - Verifique que las plantillas limpias se generaron correctamente
   - Use las plantillas limpias (con sufijo `-clean.template.json`) en el comando `create-stack-refactor`

4. **Verifique que está usando las rutas correctas**:
   - ✓ Correcto: `--source-template-body file://AmberMonolithStack-<su-nombre>-clean.template.json`
   - ✗ Incorrecto: `--source-template-body file://cdk-app/cdk.out/AmberMonolithStack-<su-nombre>.template.json`

5. **Estructura correcta de una plantilla limpia**:
   ```json
   {
     "Resources": {
       "TableCD117FA1": {
         "Type": "AWS::DynamoDB::Table",
         "Properties": {
           "TableName": "amber-data-<su-nombre>",
           "BillingMode": "PAY_PER_REQUEST",
           ...
         }
       }
     }
   }
   ```
   
   La plantilla debe contener SOLO la sección `Resources`. NO debe contener `CDKMetadata`, `Conditions`, `Parameters` o `Rules`.

**Prevención**: Siempre use plantillas limpias generadas por los scripts de limpieza para operaciones de Stack Refactoring. Las plantillas CDK originales (en `cdk.out/`) NO son compatibles con Stack Refactoring cuando se usa `--enable-stack-creation`.

---

### Error: "Stack Refactor does not support AWS::CDK::Metadata"

**Síntoma**: Error al crear el Refactor Set indicando que el tipo de recurso `AWS::CDK::Metadata` no es soportado.

**Ejemplos de mensajes de error**:
```
An error occurred (ValidationException) when calling the CreateStackRefactor operation:
Stack Refactor does not support AWS::CDK::Metadata
```

**Causa**: Las plantillas de CloudFormation contienen un recurso `CDKMetadata` de tipo `AWS::CDK::Metadata` que CDK genera automáticamente para telemetría. Stack Refactoring no soporta este tipo de recurso.

**Solución**:

1. Verifique que `cdk.json` incluye `"versionReporting": false`:
   ```bash
   cat cdk-app/cdk.json | grep versionReporting
   ```
   Debe mostrar: `"versionReporting": false`

2. Si no está presente, agréguelo como propiedad de primer nivel en `cdk.json`:
   ```json
   {
     "app": "npx ts-node --prefer-ts-exts bin/amber-app.ts",
     "versionReporting": false,
     ...
   }
   ```

3. Regenere las plantillas con `cdk synth`:
   ```bash
   cdk synth -c participantName=<su-nombre> --profile <nombre-perfil>
   ```

4. Vuelva a limpiar las plantillas con los scripts de limpieza (Paso 5.5)

**Nota**: El repositorio del workshop ya incluye `"versionReporting": false` en `cdk.json`. Este error solo ocurre si alguien modifica accidentalmente esta configuración.

---

### Error: "Parameter values specified for a template which does not require them"

**Síntoma**: Error al crear el Refactor Set indicando que se especificaron valores de parámetros para una plantilla que no los requiere.

**Ejemplos de mensajes de error**:
```
An error occurred (ValidationException) when calling the CreateStackRefactor operation:
Parameter values specified for a template which does not require them
```

**Causa**: Se intentó usar una plantilla sin sección `Parameters` para un stack que ya tiene `Parameters` desplegados, o viceversa. Esto puede ocurrir si se limpia la plantilla del stack source (ya desplegado) removiendo sus `Parameters` y `Rules`.

**Solución**:

1. Use los scripts de limpieza del repositorio (`clean-cdk-template.sh` o `clean-cdk-template.ps1`) que manejan ambos casos correctamente
2. Regenere las plantillas limpias siguiendo el Paso 5.5 del laboratorio
3. Cree un nuevo Refactor Set con las plantillas limpias

**Nota técnica**: La plantilla del stack source (MonolithStack, ya desplegado) puede usarse tal cual porque sus `Parameters` y `Rules` ya están desplegados. Sin embargo, los scripts de limpieza eliminan estas secciones de ambas plantillas para simplificar el proceso, y esto funciona correctamente.

---

### Error: "Could not find any source stacks for Logical ID and Stack ID pairs"

**Síntoma**: Error al crear el Refactor Set indicando que no se encontraron stacks de origen para ciertos Logical IDs.

**Ejemplos de mensajes de error**:
```
An error occurred (ValidationException) when calling the CreateStackRefactor operation:
Could not find any source stacks for Logical ID and Stack ID pairs: PlaceholderTopic -> AmberMonolithStack-nombre
```

**Causa**: La plantilla del stack source no contiene un recurso que sí existe en el stack desplegado. Esto ocurre cuando el PlaceholderTopic (SNS Topic) no está incluido en la plantilla source.

**Solución**:

1. Verifique que el archivo `amber-monolith-stack.ts` contiene el PlaceholderTopic:
   ```typescript
   new sns.Topic(this, 'PlaceholderTopic', {
     displayName: `amber-placeholder-${props.participantName}`,
   });
   ```

2. Si el PlaceholderTopic no está en el código, agréguelo (ya está incluido en el código original del repositorio)

3. Regenere las plantillas con `cdk synth` y vuelva a limpiarlas (Paso 5.5)

4. Verifique que la plantilla limpia del MonolithStack contiene el PlaceholderTopic:
   ```bash
   cat AmberMonolithStack-<su-nombre>-clean.template.json | grep PlaceholderTopic
   ```

**Nota**: El PlaceholderTopic es necesario porque CloudFormation no permite stacks vacíos. Cuando la tabla DynamoDB se mueve al DataStack, el MonolithStack necesita al menos un recurso (el PlaceholderTopic) para permanecer válido.

---

### Error: BOM en plantillas JSON generadas con PowerShell

**Síntoma**: Error de parsing JSON al usar plantillas generadas con PowerShell en comandos de CloudFormation.

**Ejemplos de mensajes de error**:
```
An error occurred (ValidationException) when calling the CreateStackRefactor operation:
Template format error: JSON not well-formed
```

**Causa**: PowerShell 5.1 (incluido en Windows 10/11) agrega un BOM (Byte Order Mark) al inicio de archivos UTF-8 cuando se usa `Out-File -Encoding UTF8`. El BOM es un carácter invisible (`\xEF\xBB\xBF`) que precede al `{` del JSON, causando que CloudFormation no pueda parsear el archivo.

**Solución**:

1. Use el script `clean-cdk-template.ps1` actualizado del repositorio, que ya corrige este problema usando `[System.IO.File]::WriteAllText()` sin BOM

2. Si generó plantillas con una versión anterior del script, regenere las plantillas limpias:
   ```powershell
   .\scripts\clean-cdk-template.ps1 -TemplatePath cdk-app\cdk.out\AmberMonolithStack-<su-nombre>.template.json
   .\scripts\clean-cdk-template.ps1 -TemplatePath cdk-app\cdk.out\AmberDataStack-<su-nombre>.template.json
   ```

3. Verifique que el archivo no tiene BOM (en PowerShell):
   ```powershell
   $bytes = [System.IO.File]::ReadAllBytes("AmberDataStack-<su-nombre>-clean.template.json")
   if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
       Write-Output "ERROR: El archivo tiene BOM"
   } else {
       Write-Output "OK: Sin BOM"
   }
   ```

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

### Error: Bootstrap toolkit stack version 30 or later is needed

**Síntoma**: Error al ejecutar `cdk deploy` o `cdk synth` indicando que se requiere una versión más reciente del CDK Bootstrap Stack.

**Ejemplos de mensajes de error**:
```
Error: This CDK CLI is not compatible with the CDK bootstrap stack in this environment.
Bootstrap toolkit stack version 30 or later is needed; current version: 29
```

O también puede aparecer como error secundario:
```
AccessDenied: User is not authorized to perform: cloudformation:DescribeEvents on resource: cdk-hnb659fds-deploy-role-*
```

**Causa**: El CDK Bootstrap Stack en la cuenta AWS está desactualizado. El Bootstrap Stack es infraestructura que CDK necesita (buckets S3, roles IAM, etc.) y debe actualizarse cuando se usan versiones nuevas de CDK CLI.

**Contexto**: Las versiones recientes de AWS CDK CLI (2.x) requieren Bootstrap Stack versión 30 o superior. Si la cuenta AWS tiene una versión antigua del Bootstrap Stack (ej: versión 29 o menor), CDK no puede desplegar correctamente.

**Solución para participantes**:
⚠️ **NO intente ejecutar `cdk bootstrap` por su cuenta**. Este comando requiere permisos elevados que los participantes no tienen.

1. Notifique al instructor inmediatamente con el mensaje de error completo
2. El instructor actualizará el Bootstrap Stack en la cuenta AWS
3. Una vez actualizado, podrá continuar con el laboratorio

**Solución para instructores**:

1. Verifique la versión actual del Bootstrap Stack:
   ```bash
   aws cloudformation describe-stacks --stack-name CDKToolkit --query 'Stacks[0].Outputs[?OutputKey==`BootstrapVersion`].OutputValue' --output text --profile <nombre-perfil>
   ```

2. Si la versión es menor a 30, actualice el Bootstrap Stack:
   ```bash
   cdk bootstrap aws://<account-id>/<region> --profile <nombre-perfil>
   ```
   
   Reemplace:
   - `<account-id>`: ID de la cuenta AWS (ej: `123456789012`)
   - `<region>`: Región del workshop (ej: `us-east-1`)
   - `<nombre-perfil>`: Perfil AWS SSO del instructor

3. Verifique que la actualización fue exitosa:
   ```bash
   aws cloudformation describe-stacks --stack-name CDKToolkit --query 'Stacks[0].Outputs[?OutputKey==`BootstrapVersion`].OutputValue' --output text --profile <nombre-perfil>
   ```
   
   Debe mostrar: `30` o superior

4. Notifique a los participantes que pueden continuar

**Prevención**: El instructor debe verificar y actualizar el Bootstrap Stack ANTES del workshop ejecutando:
```bash
cdk bootstrap aws://<account-id>/<region> --profile <nombre-perfil>
```

**Nota técnica**: El error secundario `AccessDenied: cloudformation:DescribeEvents` es una consecuencia del Bootstrap Stack desactualizado. El rol `cdk-hnb659fds-deploy-role` es creado por el Bootstrap Stack y tendrá los permisos correctos después de la actualización. NO es necesario ajustar permisos IAM manualmente.

**Recursos adicionales**:
- [AWS CDK Bootstrapping Documentation](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)
- [CDK Bootstrap Stack Versioning](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html#bootstrapping-versions)

---

## Laboratorio 2: SafeDeploy Hooks

_Esta sección será completada en el spec del Laboratorio 2._

---

## Laboratorio 3: Validation & Troubleshooting

_Esta sección será completada en el spec del Laboratorio 3._
