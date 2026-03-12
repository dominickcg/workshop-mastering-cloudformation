# Guía de Solución de Problemas - Laboratorio 2

Esta guía contiene soluciones a errores comunes que puede encontrar durante el Laboratorio 2: Early Validation & Troubleshooting.

## Índice

- [Errores Esperados del Laboratorio](#errores-esperados-del-laboratorio)
  - [Error: Bucket name already exists](#error-bucket-name-already-exists)
  - [Error: AccessDenied on lambda:CreateFunction](#error-accessdenied-on-lambdacreatefunction)
  - [Error: Operation ID not found](#error-operation-id-not-found)
  - [Error: Stack is in UPDATE_ROLLBACK_COMPLETE state](#error-stack-is-in-update_rollback_complete-state)
- [Errores que Requieren Asistencia del Instructor](#errores-que-requieren-asistencia-del-instructor)
  - [Errores de Permisos IAM](#errores-de-permisos-iam)
  - [Errores de Límites de Cuota de AWS](#errores-de-límites-de-cuota-de-aws)

---

## Errores Esperados del Laboratorio

Estos errores son parte del flujo pedagógico del laboratorio y tienen soluciones específicas documentadas.

### Error: Bucket name already exists

**Síntoma:**

Al ejecutar `cdk deploy` en el Paso 3, recibe un error similar a:

```
❌  AmberMonolithStack-{nombre-participante} failed: Error: The stack named AmberMonolithStack-{nombre-participante} failed creation, it may need to be manually deleted from the AWS console: ROLLBACK_COMPLETE: Resource handler returned message: "Bucket name already exists (Service: S3, Status Code: 409, Request ID: ...)"
```

O durante la creación del Change Set:

```
❌ Deployment failed: Error: The bucket name 'amber-workshop-bucket' is already in use by another AWS account or has been reserved globally.
```

**Causa:**

Los nombres de S3 Bucket son globalmente únicos en toda la infraestructura de AWS. El nombre `amber-workshop-bucket` (o cualquier nombre explícito que haya especificado) ya está siendo utilizado por otra cuenta de AWS o fue reservado previamente.

Este error es **intencional** en el laboratorio para demostrar la funcionalidad de Early Validation de CloudFormation, que detecta el conflicto durante la creación del Change Set antes de iniciar el aprovisionamiento de recursos.

**Solución:**

1. Abra el archivo `lab-1-stack-refactoring/cdk-app/lib/amber-monolith-stack.ts`

2. Elimine la propiedad `bucketName` del constructor del Bucket S3:

   **Antes (código con error):**
   ```typescript
   new s3.Bucket(this, 'Bucket', {
     bucketName: 'amber-workshop-bucket',  // ← Eliminar esta línea
     removalPolicy: cdk.RemovalPolicy.DESTROY,
     autoDeleteObjects: true,
   });
   ```

   **Después (código corregido):**
   ```typescript
   new s3.Bucket(this, 'Bucket', {
     removalPolicy: cdk.RemovalPolicy.DESTROY,
     autoDeleteObjects: true,
   });
   ```

3. Guarde el archivo y ejecute `cdk synth` para verificar que la plantilla se genera correctamente

4. Continúe con el Paso 5 del laboratorio

**Nota:** Al eliminar `bucketName`, CDK autogenerará un nombre único para el bucket usando el formato `ambermonolithstack-{nombre-participante}-bucket{hash}-{random}`, garantizando que no haya conflictos globales.

---

### Error: AccessDenied on lambda:CreateFunction

**Síntoma:**

Al ejecutar `cdk deploy` en el Paso 7 (después de ejecutar `restrict-permissions.sh`), el despliegue falla con un error similar a:

```
❌  AmberMonolithStack-{nombre-participante} failed: Error: The stack named AmberMonolithStack-{nombre-participante} failed to deploy: UPDATE_ROLLBACK_COMPLETE
```

Al revisar los eventos del Stack en la consola de CloudFormation o usando `describe-stack-events`, ve un mensaje como:

```
CREATE_FAILED | AWS::Lambda::Function | HelloFunction...
Resource handler returned message: "User: arn:aws:sts::123456789012:assumed-role/cdk-hnb659fds-cfn-exec-role-123456789012-us-east-1/AWSCloudFormation is not authorized to perform: lambda:CreateFunction on resource: arn:aws:lambda:us-east-1:123456789012:function:amber-hello-{nombre-participante} because an explicit deny in an identity-based policy"
```

**Causa:**

El script `restrict-permissions.sh` agregó una política IAM inline al rol de ejecución de CloudFormation que deniega explícitamente el permiso `lambda:CreateFunction`. Esta política de denegación (`Effect: Deny`) prevalece sobre cualquier permiso de tipo `Allow`, impidiendo que CloudFormation cree la función Lambda.

Este error es **intencional** en el laboratorio para simular un escenario realista de permisos insuficientes y practicar técnicas de troubleshooting con Operation ID.

**Solución:**

1. Extraiga el Operation ID del despliegue fallido ejecutando:

   ```bash
   aws cloudformation describe-stacks \
     --stack-name AmberMonolithStack-{nombre-participante} \
     --query 'Stacks[0].LastOperations[0].OperationId' \
     --output text
   ```

2. Use el Operation ID para filtrar únicamente los eventos fallidos (Paso 9 del laboratorio):

   ```bash
   aws cloudformation describe-stack-events \
     --stack-name AmberMonolithStack-{nombre-participante} \
     --operation-id <OPERATION_ID> \
     --query "StackEvents[?ResourceStatus=='CREATE_FAILED' || ResourceStatus=='UPDATE_FAILED'].[LogicalResourceId,ResourceType,ResourceStatus,ResourceStatusReason]" \
     --output table
   ```

3. Identifique el mensaje de error que menciona `lambda:CreateFunction` denegado

4. Restaure los permisos ejecutando el script de restauración:

   ```bash
   cd lab-2-validation-troubleshooting
   ./scripts/restore-permissions.sh {nombre-participante}
   ```

5. Espere 10 segundos para que los cambios de IAM se propaguen

6. Ejecute nuevamente `cdk deploy` desde el directorio `lab-1-stack-refactoring/cdk-app/`

**Verificación:** El despliegue debe completarse exitosamente con estado `UPDATE_COMPLETE`, creando tanto el S3 Bucket como la Lambda Function.

---

### Error: Operation ID not found

**Síntoma:**

Al ejecutar el comando `describe-stacks` en el Paso 8 para extraer el Operation ID, recibe un error o un valor vacío:

```bash
aws cloudformation describe-stacks \
  --stack-name AmberMonolithStack-{nombre-participante} \
  --query 'Stacks[0].LastOperations[0].OperationId' \
  --output text
```

Resultado:
```
None
```

O el comando `describe-stack-events` con `--operation-id` falla con:

```
An error occurred (ValidationError) when calling the DescribeStackEvents operation: Operation ID not found
```

**Causa:**

El campo `LastOperations` solo está presente cuando el Stack ha tenido operaciones recientes (creación o actualización). Posibles causas:

1. **El Stack no ha tenido operaciones fallidas recientemente**: Si el Stack está en estado `CREATE_COMPLETE` o `UPDATE_COMPLETE` sin fallos recientes, el campo `LastOperations` puede estar vacío o no existir
2. **Sintaxis incorrecta del query**: El path JMESPath puede estar mal escrito
3. **Versión antigua de AWS CLI**: Versiones muy antiguas de AWS CLI pueden no soportar el campo `LastOperations`

**Solución:**

1. Verifique el estado actual del Stack:

   ```bash
   aws cloudformation describe-stacks \
     --stack-name AmberMonolithStack-{nombre-participante} \
     --query 'Stacks[0].StackStatus' \
     --output text
   ```

2. Si el estado es `UPDATE_ROLLBACK_COMPLETE`, el Stack tuvo un fallo reciente. Verifique la estructura completa de `LastOperations`:

   ```bash
   aws cloudformation describe-stacks \
     --stack-name AmberMonolithStack-{nombre-participante} \
     --query 'Stacks[0].LastOperations' \
     --output json
   ```

3. Si el output muestra un array con al menos un elemento, extraiga el Operation ID usando el índice correcto:

   ```bash
   aws cloudformation describe-stacks \
     --stack-name AmberMonolithStack-{nombre-participante} \
     --query 'Stacks[0].LastOperations[0].OperationId' \
     --output text
   ```

4. Si el campo `LastOperations` no existe o está vacío, es posible que:
   - El Stack no haya tenido operaciones fallidas recientemente (verifique que ejecutó el Paso 7 correctamente)
   - Necesite actualizar AWS CLI a la versión más reciente:
     ```bash
     aws --version  # Debe ser 2.x o superior
     ```

5. Como alternativa, puede listar todos los eventos recientes sin filtrar por Operation ID:

   ```bash
   aws cloudformation describe-stack-events \
     --stack-name AmberMonolithStack-{nombre-participante} \
     --max-items 20 \
     --query "StackEvents[?ResourceStatus=='CREATE_FAILED' || ResourceStatus=='UPDATE_FAILED'].[Timestamp,LogicalResourceId,ResourceType,ResourceStatusReason]" \
     --output table
   ```

**Nota:** El campo `LastOperations` fue introducido en versiones recientes de CloudFormation. Si su cuenta de AWS o región no soporta esta funcionalidad, puede completar el laboratorio usando el método alternativo de listar eventos sin filtrar por Operation ID.

---

### Error: Stack is in UPDATE_ROLLBACK_COMPLETE state

**Síntoma:**

Al intentar ejecutar `cdk deploy` después de un despliegue fallido, recibe un error:

```
❌  AmberMonolithStack-{nombre-participante} failed: Error: Stack is in UPDATE_ROLLBACK_COMPLETE state and can not be updated.
```

O en la consola de CloudFormation, el Stack muestra estado `UPDATE_ROLLBACK_COMPLETE` en color naranja.

**Causa:**

El Stack tuvo un despliegue fallido (por ejemplo, el error de `lambda:CreateFunction` en el Paso 7) y CloudFormation ejecutó un Rollback automático para revertir los cambios. El estado `UPDATE_ROLLBACK_COMPLETE` indica que el Rollback se completó exitosamente y el Stack volvió a su estado anterior estable.

Este estado **no impide** nuevos despliegues. Es simplemente un indicador de que el último intento de actualización falló y fue revertido.

**Solución:**

1. **No es necesario eliminar o recrear el Stack.** El estado `UPDATE_ROLLBACK_COMPLETE` es un estado válido desde el cual se puede iniciar una nueva actualización.

2. Identifique y corrija la causa del fallo anterior:
   - Si el error fue por permisos IAM, ejecute `restore-permissions.sh` (ver sección anterior)
   - Si el error fue por configuración incorrecta en el código CDK, corrija el código

3. Una vez corregido el problema, ejecute nuevamente `cdk deploy`:

   ```bash
   cd lab-1-stack-refactoring/cdk-app
   cdk deploy AmberMonolithStack-{nombre-participante}
   ```

4. CloudFormation iniciará una nueva operación de actualización desde el estado `UPDATE_ROLLBACK_COMPLETE` hacia `UPDATE_IN_PROGRESS` y finalmente `UPDATE_COMPLETE` si tiene éxito.

**Verificación:** Después del despliegue exitoso, el estado del Stack debe cambiar a `UPDATE_COMPLETE` (verde en la consola).

**Nota:** Si el Stack permanece en `UPDATE_ROLLBACK_COMPLETE` después de múltiples intentos de corrección, revise cuidadosamente los eventos del Stack usando `describe-stack-events` para identificar la causa raíz del fallo.

---

## Errores que Requieren Asistencia del Instructor

Los siguientes errores están fuera del alcance del laboratorio y requieren intervención del instructor o del administrador de la cuenta de AWS.

### Errores de Permisos IAM

**Síntomas:**

- Errores de tipo `AccessDenied` o `UnauthorizedException` que **no** están relacionados con `lambda:CreateFunction` (el error intencional del laboratorio)
- Mensajes como:
  - `User is not authorized to perform: cloudformation:CreateStack`
  - `User is not authorized to perform: iam:CreateRole`
  - `User is not authorized to perform: s3:CreateBucket`
  - `User is not authorized to perform: sts:AssumeRole`

**Causa:**

Su usuario de IAM o rol no tiene los permisos necesarios para ejecutar las operaciones del laboratorio. Esto puede deberse a:
- Políticas IAM restrictivas aplicadas a su usuario
- Falta de permisos en el rol de ejecución de CloudFormation
- Service Control Policies (SCPs) de AWS Organizations que restringen operaciones

**Solución:**

⚠️ **NO intente solucionar este error por su cuenta.**

1. Anote el mensaje de error completo
2. Notifique al instructor de inmediato
3. Proporcione la siguiente información:
   - Su nombre de participante
   - El comando que estaba ejecutando
   - El mensaje de error completo
   - La región de AWS que está utilizando

El instructor verificará y ajustará los permisos necesarios en su cuenta.

---

### Errores de Límites de Cuota de AWS

**Síntomas:**

- Errores que mencionan "quota", "limit", o "exceeded":
  - `LimitExceededException: Cannot create more Lambda functions in this region`
  - `You have exceeded the maximum number of S3 buckets`
  - `Cannot exceed quota for Stacks in region`
- Mensajes de Service Quotas:
  - `The maximum number of VPCs has been reached`
  - `Instance limit exceeded`

**Causa:**

Su cuenta de AWS ha alcanzado los límites de cuota (Service Quotas) para uno o más servicios. Las cuentas de AWS tienen límites predeterminados para proteger contra uso excesivo accidental.

Límites comunes que pueden afectar este laboratorio:
- **CloudFormation Stacks**: 200 por región (límite predeterminado)
- **Lambda Functions**: 1000 por región (límite predeterminado)
- **S3 Buckets**: 100 por cuenta (límite global)

**Solución:**

⚠️ **NO intente solucionar este error por su cuenta.**

1. Anote el mensaje de error completo
2. Notifique al instructor de inmediato
3. Proporcione la siguiente información:
   - Su nombre de participante
   - El servicio que alcanzó el límite (Lambda, S3, CloudFormation, etc.)
   - El mensaje de error completo
   - La región de AWS que está utilizando

El instructor puede:
- Solicitar un aumento de cuota a AWS Support (puede tardar 24-48 horas)
- Limpiar recursos no utilizados en la cuenta
- Asignarle una región alternativa con cuotas disponibles

**Prevención:** Al finalizar el workshop, asegúrese de limpiar todos los recursos creados para liberar cuotas.

---

## Otros Errores Comunes

### Error: Permission denied al ejecutar scripts

**Síntoma:**

```bash
./scripts/restrict-permissions.sh {nombre-participante}
bash: ./scripts/restrict-permissions.sh: Permission denied
```

**Causa:**

Los scripts no tienen permisos de ejecución.

**Solución:**

```bash
chmod +x scripts/*.sh
./scripts/restrict-permissions.sh {nombre-participante}
```

---

### Error: CDK bootstrap no ejecutado

**Síntoma:**

```
❌ AmberMonolithStack-{nombre-participante} failed: Error: This stack uses assets, so the toolkit stack must be deployed to the environment
```

**Causa:**

La cuenta/región no ha sido inicializada con `cdk bootstrap`.

**Solución:**

```bash
cdk bootstrap aws://{account-id}/{region}
```

Reemplace `{account-id}` con su ID de cuenta y `{region}` con la región configurada.

---

### Error: Node.js o npm no instalado

**Síntoma:**

```bash
cdk deploy
bash: cdk: command not found
```

**Causa:**

Node.js o AWS CDK no están instalados en su entorno.

**Solución:**

1. Instale Node.js 18 o superior desde [nodejs.org](https://nodejs.org/)
2. Instale AWS CDK globalmente:
   ```bash
   npm install -g aws-cdk
   ```
3. Verifique la instalación:
   ```bash
   cdk --version
   ```

---

Si encuentra un error que no está documentado en esta guía, consulte al instructor antes de continuar.
