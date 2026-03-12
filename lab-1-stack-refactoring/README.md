# 🔄 Laboratorio 1: Stack Refactoring con AWS CDK

## Información del Laboratorio

**Método de implementación**: IaC (AWS CDK + TypeScript) + AWS CLI

**Tiempo estimado**: 30 minutos

**Contexto del workshop**: Este es el Laboratorio 1 de un workshop de 3 laboratorios (duración total: 2 horas). Los recursos creados en este laboratorio serán utilizados en los Laboratorios 2 y 3. NO elimine estos recursos al finalizar este laboratorio.

### Convenciones de Formato

Este laboratorio utiliza las siguientes convenciones para indicar valores que debe reemplazar:

- `{nombre-participante}`: Su nombre de participante en minúsculas, usado en nombres de recursos AWS (ej: `luis`, `maria`, `carlos`)
- `<su-nombre>`: Su nombre de participante, usado en parámetros de comandos y contextos CDK
- `<refactor-set-id>`: ID del Refactor Set generado por AWS CloudFormation (proporcionado en la salida de comandos)
- `<url-del-repositorio-github>`: URL del repositorio proporcionada por el instructor al inicio del workshop

**Importante**: Cuando vea estos placeholders, reemplácelos con los valores reales. NO escriba literalmente los símbolos `{}` o `<>`.

**Ejemplo**:
- Comando con placeholder: `aws dynamodb describe-table --table-name amber-data-<su-nombre>`
- Comando con valor real: `aws dynamodb describe-table --table-name amber-data-luis`

## Índice

- [Objetivos de Aprendizaje](#objetivos-de-aprendizaje)
- [Prerrequisitos](#prerrequisitos)
- [Configuración del Entorno](#configuración-del-entorno)
- [Arquitectura](#arquitectura)
- [Pasos del Laboratorio](#pasos-del-laboratorio)
  - [Paso 0: Clonar el repositorio del workshop](#paso-0-clonar-el-repositorio-del-workshop)
  - [Paso 1: Verificar región de AWS](#paso-1-verificar-región-de-aws)
  - [Paso 2: Instalar dependencias del proyecto CDK](#paso-2-instalar-dependencias-del-proyecto-cdk)
  - [Paso 3: Desplegar el Stack monolítico](#paso-3-desplegar-el-stack-monolítico)
  - [Paso 4: Insertar datos de prueba](#paso-4-insertar-datos-de-prueba)
  - [Paso 5: Refactorizar el código CDK](#paso-5-refactorizar-el-código-cdk)
  - [Paso 5.5: Extraer y Limpiar Plantillas CDK](#paso-55-extraer-y-limpiar-plantillas-cdk)
  - [Paso 6: Extraer Logical IDs de las plantillas](#paso-6-extraer-logical-ids-de-las-plantillas)
  - [Paso 7: Crear archivo de mapeo](#paso-7-crear-archivo-de-mapeo)
  - [Paso 8: Crear Refactor Set](#paso-8-crear-refactor-set)
  - [Paso 9: Ejecutar Stack Refactoring](#paso-9-ejecutar-stack-refactoring)
  - [Paso 10: Verificar migración exitosa](#paso-10-verificar-migración-exitosa)
  - [Paso 11: Despliegue post-refactoring](#paso-11-despliegue-post-refactoring)
- [Limpieza](#limpieza)
- [Solución de Problemas](#solución-de-problemas)

## Objetivos de Aprendizaje

Al completar este laboratorio, serás capaz de:

- Comprender el concepto de Stack Refactoring en AWS CloudFormation y sus casos de uso
- Mover recursos con estado (DynamoDB) entre Stacks de CloudFormation sin destrucción ni recreación
- Ejecutar migraciones Zero-Downtime usando la funcionalidad Stack Refactoring
- Combinar AWS CDK con AWS CLI para operaciones avanzadas de infraestructura como código

## Prerrequisitos

### Herramientas Requeridas

- **AWS CLI**: Versión 2.x o superior
- **Node.js**: Versión 18.x o superior
- **npm**: Incluido con Node.js
- **AWS CDK CLI**: Versión 2.x o superior

### Autenticación con AWS

Este laboratorio utiliza **AWS SSO (Single Sign-On)** como método principal de autenticación.

#### Configuración de AWS SSO

1. **Identificar el nombre del perfil SSO**: El instructor le proporcionará el nombre del perfil SSO configurado para el workshop (ej: `workshop-profile`, `dev-profile`, etc.)

2. **Iniciar sesión con AWS SSO**:
   ```bash
   aws sso login --profile <nombre-perfil>
   ```
   
   Este comando abrirá su navegador web para completar la autenticación. Una vez autenticado, puede cerrar el navegador y regresar a la terminal.

3. **Verificar la autenticación**:
   ```bash
   aws sts get-caller-identity --profile <nombre-perfil>
   ```
   
   Debe mostrar su información de cuenta AWS (UserId, Account, Arn).

4. **Verificar la región configurada**:
   ```bash
   aws configure get region --profile <nombre-perfil>
   ```
   
   Debe mostrar la región indicada por el instructor (ej: `us-east-1`).

**Nota para participantes sin SSO**: Si no usa AWS SSO (por ejemplo, si usa credenciales de acceso programático tradicionales), puede omitir el parámetro `--profile <nombre-perfil>` en todos los comandos de este laboratorio. En ese caso, AWS CLI y CDK usarán las credenciales configuradas por defecto.

**Importante para comandos CDK**: Todos los comandos `cdk` (synth, deploy, etc.) requieren el parámetro `--profile <nombre-perfil>` para usar las credenciales de AWS SSO. Alternativamente, puede configurar la variable de entorno:

**Bash:**
```bash
export AWS_PROFILE=<nombre-perfil>
```

**PowerShell:**
```powershell
$env:AWS_PROFILE = "<nombre-perfil>"
```

Una vez configurada la variable de entorno, puede omitir el parámetro `--profile` en los comandos.

### Permisos Necesarios

Su perfil de AWS debe tener permisos para:
- AWS CloudFormation (crear, actualizar, eliminar Stacks y ejecutar Stack Refactoring)
- Amazon DynamoDB (crear, leer, actualizar tablas)

### Requisito de CDK Bootstrap

AWS CDK requiere infraestructura previa en su cuenta AWS para funcionar correctamente. Esta infraestructura se llama **CDK Bootstrap Stack** e incluye:
- Bucket S3 para almacenar assets (plantillas, archivos Lambda, etc.)
- Roles IAM para despliegues
- Recursos de ECR para imágenes Docker (si se usan)

**Versión requerida**: Este laboratorio requiere CDK Bootstrap Stack versión **30 o superior**.

#### Verificación del Bootstrap Stack

⚠️ **IMPORTANTE**: El instructor debe haber ejecutado `cdk bootstrap` en la cuenta AWS ANTES del workshop. Como participante, solo necesita verificar que el Bootstrap Stack existe y tiene la versión correcta.

**Verificar la versión del Bootstrap Stack**:

```bash
aws cloudformation describe-stacks --stack-name CDKToolkit --query 'Stacks[0].Outputs[?OutputKey==`BootstrapVersion`].OutputValue' --output text --profile <nombre-perfil>
```

**Resultado esperado**: Debe mostrar un número igual o mayor a `30` (ej: `30`, `31`, `32`, etc.)

**Si la versión es menor a 30**:
⚠️ Notifique al instructor inmediatamente. NO intente ejecutar `cdk bootstrap` por su cuenta, ya que requiere permisos elevados que los participantes no tienen.

**Si el comando falla con error "Stack with id CDKToolkit does not exist"**:
⚠️ Notifique al instructor inmediatamente. El Bootstrap Stack no está configurado en la cuenta.

#### ¿Por qué es necesario el Bootstrap Stack?

El Bootstrap Stack es necesario porque:
1. **CDK necesita almacenar assets**: Las plantillas de CloudFormation generadas y otros archivos deben almacenarse en S3 antes del despliegue
2. **Roles IAM específicos**: CDK usa roles IAM especializados para desplegar recursos de forma segura
3. **Compatibilidad de versiones**: Versiones nuevas de CDK CLI (2.x) requieren versiones actualizadas del Bootstrap Stack (30+)

**Nota técnica**: El Bootstrap Stack se despliega una sola vez por cuenta y región. Una vez configurado, todos los proyectos CDK en esa cuenta/región pueden usarlo.

### Verificación de Instalación

Ejecute los siguientes comandos para verificar que las herramientas están instaladas correctamente:

```bash
# Verificar AWS CLI
aws --version
# Debe mostrar: aws-cli/2.x.x o superior

# Verificar Node.js
node --version
# Debe mostrar: v18.x.x o superior

# Verificar npm
npm --version
# Debe mostrar: 9.x.x o superior

# Verificar AWS CDK CLI
cdk --version
# Debe mostrar: 2.x.x o superior
```

## Configuración del Entorno

### Verificar Región de AWS

Antes de comenzar, verifique que está trabajando en la región correcta:

```bash
# Verificar región configurada con su perfil SSO
aws configure get region --profile <nombre-perfil>

# Si no es correcta, configure la región indicada por el instructor
aws configure set region us-east-1 --profile <nombre-perfil>
```

### Verificar Versión de CDK CLI

```bash
cdk --version
```

Si necesita instalar o actualizar AWS CDK CLI:

```bash
npm install -g aws-cdk
```

## Arquitectura

Este laboratorio demuestra cómo mover una tabla DynamoDB desde un Stack monolítico hacia un Stack dedicado de datos, sin destruir ni recrear el recurso físico.

### Flujo de Stack Refactoring

```mermaid
graph TB
    subgraph sg1["Estado Inicial"]
        A[AmberMonolithStack] --> B[(DynamoDB)]
    end

    subgraph sg2["Refactorización CDK"]
        C[AmberMonolithStack vacío]
        D[AmberDataStack] --> E[(DynamoDB)]
    end

    subgraph sg3["Stack Refactoring"]
        F[create-stack-refactor] --> G[execute-stack-refactor]
        G --> H[Recurso migrado]
    end

    A -->|1. cdk synth| C
    A -->|1. cdk synth| D
    C -->|2. CLI| F
    H -->|3. cdk deploy| I[Estado Final]

    style B fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#9f9,stroke:#333,stroke-width:2px
```

### Proceso de Migración

1. **Estado Inicial**: AmberMonolithStack contiene la tabla DynamoDB con datos
2. **Refactorización del Código**: Se crea AmberDataStack con la misma definición de tabla
3. **Stack Refactoring**: CloudFormation transfiere la gestión del recurso físico sin recrearlo
4. **Estado Final**: AmberDataStack gestiona la tabla DynamoDB, los datos persisten intactos

## Pasos del Laboratorio

### Paso 0: Clonar el repositorio del workshop

Antes de comenzar con el laboratorio, debe obtener todos los archivos necesarios del repositorio de GitHub.

1. Clone el repositorio del workshop:
   ```bash
   git clone <url-del-repositorio-github>
   ```
   
   Reemplace `<url-del-repositorio-github>` con la URL proporcionada por el instructor.

2. Navegue al directorio del laboratorio:
   ```bash
   cd lab-1-stack-refactoring
   ```

**Nota**: El repositorio contiene todos los archivos de código CDK, scripts y plantillas necesarios para completar este laboratorio. Los archivos incluyen:
- Proyecto CDK con código TypeScript (`cdk-app/`)
- Scripts de soporte para datos de prueba (`scripts/`)
- Plantilla del archivo de mapeo JSON (`refactor-mapping.json`)

Una vez clonado el repositorio, continúe con el Paso 1 para verificar la región de AWS.

### Paso 1: Verificar región de AWS

1. Verifique que está trabajando en la región correcta:
   
   **Bash:**
   ```bash
   aws configure get region --profile <nombre-perfil>
   ```
   
   **PowerShell:**
   ```powershell
   aws configure get region --profile <nombre-perfil>
   ```
   
   - Si no es correcta, configure la región: `aws configure set region us-east-1 --profile <nombre-perfil>`
   - O use el parámetro `--region` en cada comando

### Paso 2: Instalar dependencias del proyecto CDK

1. Navegue al directorio del proyecto CDK:
   ```bash
   cd cdk-app
   ```

2. Instale las dependencias de Node.js:
   ```bash
   npm install
   ```

   Este comando instalará AWS CDK v2 y todas las dependencias necesarias.

### Paso 3: Desplegar el Stack monolítico

1. Sintetice la plantilla de CloudFormation:
   ```bash
   cdk synth -c participantName=<su-nombre> --profile <nombre-perfil>
   ```
   
   Reemplace `<su-nombre>` con su nombre de participante (ej: `luis`, `maria`, `carlos`) y `<nombre-perfil>` con el nombre de su perfil AWS SSO (ej: `amber-labs-workshop`).
   
   Este comando genera las plantillas de CloudFormation en el directorio `cdk.out/`.

2. Despliegue el Stack monolítico:
   ```bash
   cdk deploy AmberMonolithStack-<su-nombre> -c participantName=<su-nombre> --profile <nombre-perfil>
   ```
   
   Cuando se le pregunte si desea continuar con el despliegue, escriba `y` y presione Enter.

3. Espere a que el despliegue se complete (aproximadamente 1-2 minutos).

**✓ Verificación**: Confirme que el Stack fue creado exitosamente:

**Bash:**
```bash
aws cloudformation describe-stacks --profile <nombre-perfil> \
  --stack-name AmberMonolithStack-<su-nombre> \
  --query 'Stacks[0].StackStatus'
```

**PowerShell:**
```powershell
aws cloudformation describe-stacks --profile <nombre-perfil> `
  --stack-name AmberMonolithStack-<su-nombre> `
  --query 'Stacks[0].StackStatus'
```

Debe mostrar: `"CREATE_COMPLETE"`

**✓ Verificación**: Confirme que la tabla DynamoDB está activa:

**Bash:**
```bash
aws dynamodb describe-table --profile <nombre-perfil> \
  --table-name amber-data-<su-nombre> \
  --query 'Table.TableStatus'
```

**PowerShell:**
```powershell
aws dynamodb describe-table --profile <nombre-perfil> `
  --table-name amber-data-<su-nombre> `
  --query 'Table.TableStatus'
```

Debe mostrar: `"ACTIVE"`

### Paso 4: Insertar datos de prueba

Ahora insertaremos un registro de prueba en la tabla DynamoDB para verificar posteriormente que los datos persisten durante el Stack Refactoring.

1. Navegue al directorio de scripts:
   ```bash
   cd ../scripts
   ```

2. Ejecute el script de inserción de datos:

   **Bash:**
   ```bash
   bash scripts/insert-test-data.sh <su-nombre>
   ```

   **PowerShell:**
   ```powershell
   .\scripts\insert-test-data.ps1 <su-nombre> -Profile <nombre-perfil>
   ```
   
   **Nota**: Si no usa AWS SSO, puede omitir el parámetro `-Profile` en PowerShell.

   **Alternativa con AWS CLI directo**:
   
   **Bash:**
   ```bash
   aws dynamodb put-item --profile <nombre-perfil> \
     --table-name amber-data-<su-nombre> \
     --item '{
       "PK": {"S": "TEST#001"},
       "data": {"S": "Registro de prueba - Stack Refactoring Lab"},
       "timestamp": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}
     }'
   ```
   
   **PowerShell:**
   ```powershell
   $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
   $item = '{\"PK\": {\"S\": \"TEST#001\"}, \"data\": {\"S\": \"Registro de prueba - Stack Refactoring Lab\"}, \"timestamp\": {\"S\": \"' + $timestamp + '\"}}'
   
   aws dynamodb put-item --profile <nombre-perfil> `
     --table-name amber-data-<su-nombre> `
     --item $item
   ```

**✓ Verificación**: Consulte el item insertado:

**Bash:**
```bash
aws dynamodb get-item --profile <nombre-perfil> \
  --table-name amber-data-<su-nombre> \
  --key '{"PK": {"S": "TEST#001"}}' \
  --query 'Item'
```

**PowerShell:**
```powershell
aws dynamodb get-item --profile <nombre-perfil> `
  --table-name amber-data-<su-nombre> `
  --key '{\"PK\": {\"S\": \"TEST#001\"}}' `
  --query 'Item'
```

Debe mostrar el registro con los campos `PK`, `data` y `timestamp`.

### Paso 5: Refactorizar el código CDK

En este paso, modificaremos el código CDK para mover la tabla DynamoDB hacia un nuevo Stack dedicado. Es crucial entender que esta refactorización es solo en el código fuente, NO desplegaremos los cambios todavía.

⚠️ **ADVERTENCIA CRÍTICA**: NO ejecute `cdk deploy` después de esta refactorización. Si lo hace, CDK intentará crear una nueva tabla DynamoDB en el AmberDataStack y eliminar la tabla del AmberMonolithStack, lo que resultaría en pérdida de datos.

1. Navegue de vuelta al directorio del proyecto CDK:
   ```bash
   cd ../cdk-app
   ```

2. Abra el archivo `bin/amber-app.ts` en su editor de texto.

3. Descomente las siguientes líneas:
   - La línea de import: `// import { AmberDataStack } from '../lib/amber-data-stack';`
   - El bloque de instanciación del AmberDataStack (líneas comentadas con `//`)

4. Abra el archivo `lib/amber-monolith-stack.ts` en su editor de texto.

5. Comente o elimine la definición de la tabla DynamoDB en `AmberMonolithStack`. Busque el bloque que comienza con `new dynamodb.Table(this, 'Table', {` y coméntelo o elimínelo completamente.

   **Importante**: Debe eliminar la tabla del stack de ORIGEN para que CloudFormation detecte que el recurso se está moviendo al stack de DESTINO.

   El archivo `lib/amber-monolith-stack.ts` debe quedar así:
   ```typescript
   import * as cdk from 'aws-cdk-lib';
   import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
   import { Construct } from 'constructs';

   interface AmberMonolithStackProps extends cdk.StackProps {
     participantName: string;
   }

   export class AmberMonolithStack extends cdk.Stack {
     constructor(scope: Construct, id: string, props: AmberMonolithStackProps) {
       super(scope, id, props);

       // Tabla DynamoDB movida a AmberDataStack en el Paso 5
       // (comentada o eliminada)
     }
   }
   ```

6. Guarde el archivo `lib/amber-monolith-stack.ts`.

7. Verifique que el archivo `bin/amber-app.ts` quedó así después de descomentar en el punto 3:
   ```typescript
   #!/usr/bin/env node
   import 'source-map-support/register';
   import * as cdk from 'aws-cdk-lib';
   import { AmberMonolithStack } from '../lib/amber-monolith-stack';
   import { AmberDataStack } from '../lib/amber-data-stack';

   const app = new cdk.App();
   const participantName = app.node.tryGetContext('participantName') || 'default';

   // Configuración de entorno para usar credenciales del perfil AWS
   const env = {
     account: process.env.CDK_DEFAULT_ACCOUNT,
     region: process.env.CDK_DEFAULT_REGION,
   };

   // Usar LegacyStackSynthesizer para evitar secciones Rules y Parameters
   // Esto es necesario para Stack Refactoring con --enable-stack-creation
   const synthesizer = new cdk.LegacyStackSynthesizer();

   new AmberMonolithStack(app, `AmberMonolithStack-${participantName}`, {
     participantName,
     env,
     synthesizer,
   });

   new AmberDataStack(app, `AmberDataStack-${participantName}`, {
     participantName,
     env,
     synthesizer,
   });

   app.synth();
   ```

8. Guarde el archivo `bin/amber-app.ts` si realizó cambios.

**✓ Verificación**: Confirme que el código fue refactorizado correctamente revisando los archivos modificados.

### Paso 5.5: Extraer y Limpiar Plantillas CDK

En este paso crítico, extraeremos las plantillas de CloudFormation generadas por CDK y las limpiaremos manualmente para que contengan SOLO la sección `Resources`. Esto es necesario porque CloudFormation Stack Refactoring con `--enable-stack-creation` tiene restricciones estrictas sobre qué secciones son permitidas durante operaciones de refactorización.

#### 5.5.1: Generar plantillas CDK con `cdk synth`

Primero, generaremos las plantillas de CloudFormation actualizadas después de la refactorización del código en el Paso 5.

1. Asegúrese de estar en el directorio del proyecto CDK:
   ```bash
   cd cdk-app
   ```

2. Ejecute `cdk synth` para generar las plantillas en el directorio `cdk.out/`:
   
   **Bash:**
   ```bash
   cdk synth -c participantName=<su-nombre> --profile <nombre-perfil>
   ```
   
   **PowerShell:**
   ```powershell
   cdk synth -c participantName=<su-nombre> --profile <nombre-perfil>
   ```
   
   Este comando genera las plantillas de CloudFormation para ambos Stacks (AmberMonolithStack y AmberDataStack) en el directorio `cdk.out/` sin desplegarlas.

**✓ Verificación**: Confirme que las plantillas fueron generadas correctamente:

**Bash:**
```bash
ls cdk.out/AmberMonolithStack-<su-nombre>.template.json
ls cdk.out/AmberDataStack-<su-nombre>.template.json
```

**PowerShell:**
```powershell
Test-Path cdk.out/AmberMonolithStack-<su-nombre>.template.json
Test-Path cdk.out/AmberDataStack-<su-nombre>.template.json
```

Ambos comandos deben confirmar que los archivos existen (Bash muestra los nombres de archivo, PowerShell muestra `True`).

#### 5.5.2: Limpiar plantillas CDK

##### ¿Por qué necesitamos limpiar las plantillas?

AWS CDK genera plantillas de CloudFormation con secciones adicionales que son útiles para el despliegue normal con CDK, pero que CloudFormation Stack Refactoring interpreta como "modificaciones" no permitidas:

1. **CDKMetadata**: Recurso de tipo `AWS::CDK::Metadata` que CDK agrega automáticamente para telemetría y análisis
2. **Conditions**: Sección con condiciones como `CDKMetadataAvailable` que controlan la creación de recursos CDK
3. **Parameters**: Parámetros como `BootstrapVersion` que CDK usa para validar compatibilidad con el Bootstrap Stack
4. **Rules**: Reglas como `CheckBootstrapVersion` que validan versiones de CDK

**Restricción de Stack Refactoring**: Cuando se usa `--enable-stack-creation`, CloudFormation Stack Refactoring SOLO permite cambios en la sección `Resources` relacionados con la migración de recursos. Cualquier cambio en `Parameters`, `Conditions`, `Rules` o recursos no relacionados con la migración causa el error "Found an action type that is not permitted during refactor operations: Modify".

**Solución**: Crear plantillas "limpias" que contengan ÚNICAMENTE la sección `Resources` con los recursos de aplicación (tabla DynamoDB), eliminando todas las secciones problemáticas.

##### Instrucciones de Limpieza

1. Navegue de vuelta al directorio raíz del laboratorio (si está en `cdk-app/`):
   ```bash
   cd ..
   ```

2. Limpie la plantilla de AmberMonolithStack usando el script de limpieza:

   **Bash:**
   ```bash
   bash scripts/clean-cdk-template.sh cdk-app/cdk.out/AmberMonolithStack-<su-nombre>.template.json
   ```

   **PowerShell:**
   ```powershell
   .\scripts\clean-cdk-template.ps1 -TemplatePath cdk-app\cdk.out\AmberMonolithStack-<su-nombre>.template.json
   ```

   El script generará automáticamente el archivo `AmberMonolithStack-<su-nombre>-clean.template.json` en el directorio actual (raíz del laboratorio).

3. Limpie la plantilla de AmberDataStack usando el script de limpieza:

   **Bash:**
   ```bash
   bash scripts/clean-cdk-template.sh cdk-app/cdk.out/AmberDataStack-<su-nombre>.template.json
   ```

   **PowerShell:**
   ```powershell
   .\scripts\clean-cdk-template.ps1 -TemplatePath cdk-app\cdk.out\AmberDataStack-<su-nombre>.template.json
   ```

   El script generará automáticamente el archivo `AmberDataStack-<su-nombre>-clean.template.json` en el directorio actual (raíz del laboratorio).

**Nota sobre ubicación de plantillas limpias**: Los scripts generan las plantillas limpias en el directorio actual (raíz del laboratorio), NO en `cdk-app/cdk.out/`. Esto facilita su uso en los pasos siguientes del laboratorio.

**✓ Verificación**: Confirme que las plantillas limpias fueron creadas en el directorio raíz del laboratorio:

**Bash:**
```bash
ls AmberMonolithStack-<su-nombre>-clean.template.json
ls AmberDataStack-<su-nombre>-clean.template.json
```

**PowerShell:**
```powershell
Test-Path AmberMonolithStack-<su-nombre>-clean.template.json
Test-Path AmberDataStack-<su-nombre>-clean.template.json
```

Ambos archivos deben existir en el directorio raíz del laboratorio (Bash muestra los nombres de archivo, PowerShell muestra `True`).

**✓ Verificación**: Confirme que las plantillas limpias NO contienen secciones problemáticas:

**Bash:**
```bash
# Verificar que NO hay CDKMetadata
cat AmberDataStack-<su-nombre>-clean.template.json | grep -c "CDKMetadata"
# Debe mostrar: 0

# Verificar que NO hay Conditions
cat AmberDataStack-<su-nombre>-clean.template.json | grep -c "Conditions"
# Debe mostrar: 0

# Verificar que NO hay Parameters
cat AmberDataStack-<su-nombre>-clean.template.json | grep -c "Parameters"
# Debe mostrar: 0

# Verificar que NO hay Rules
cat AmberDataStack-<su-nombre>-clean.template.json | grep -c "Rules"
# Debe mostrar: 0
```

**PowerShell:**
```powershell
# Verificar que NO hay secciones problemáticas
$template = Get-Content AmberDataStack-<su-nombre>-clean.template.json | ConvertFrom-Json

if ($template.PSObject.Properties.Name -contains 'Conditions') {
    Write-Output "ERROR: Conditions encontrada"
} else {
    Write-Output "OK: Sin Conditions"
}

if ($template.PSObject.Properties.Name -contains 'Parameters') {
    Write-Output "ERROR: Parameters encontrada"
} else {
    Write-Output "OK: Sin Parameters"
}

if ($template.PSObject.Properties.Name -contains 'Rules') {
    Write-Output "ERROR: Rules encontrada"
} else {
    Write-Output "OK: Sin Rules"
}

if ($template.Resources.PSObject.Properties.Name -contains 'CDKMetadata') {
    Write-Output "ERROR: CDKMetadata encontrado"
} else {
    Write-Output "OK: Sin CDKMetadata"
}
```

**✓ Verificación**: Confirme que la plantilla limpia de AmberDataStack contiene la tabla DynamoDB:

**Bash:**
```bash
cat AmberDataStack-<su-nombre>-clean.template.json | grep -c "AWS::DynamoDB::Table"
# Debe mostrar: 1 (una tabla)
```

**PowerShell:**
```powershell
$template = Get-Content AmberDataStack-<su-nombre>-clean.template.json | ConvertFrom-Json
$tableCount = ($template.Resources.PSObject.Properties | Where-Object { $_.Value.Type -eq "AWS::DynamoDB::Table" }).Count
Write-Output "Tablas DynamoDB encontradas: $tableCount"
# Debe mostrar: 1
```

**Resultado esperado**: Las plantillas limpias contienen SOLO la sección `Resources` con los recursos de aplicación, sin `CDKMetadata`, `Conditions`, `Parameters` o `Rules`. Estas plantillas están listas para ser usadas en el Stack Refactoring.

#### 5.5.3: Inspeccionar contenido de plantillas limpias

Ahora que ha creado las plantillas limpias, es importante entender qué deben contener exactamente para que el Stack Refactoring funcione correctamente.

**Contenido esperado de AmberDataStack-<su-nombre>-clean.template.json**:

La plantilla limpia del Stack de destino debe contener:
- **Sección `Resources`**: Con la definición completa de la tabla DynamoDB
- **Logical ID de la tabla**: Debe coincidir con el Logical ID original (ej: `TableCD117FA1`)
- **Propiedades de la tabla**: `TableName`, `BillingMode`, `AttributeDefinitions`, `KeySchema`, etc.

La plantilla NO debe contener:
- Recurso `CDKMetadata` (tipo `AWS::CDK::Metadata`)
- Sección `Conditions` (como `CDKMetadataAvailable`)
- Sección `Parameters` (como `BootstrapVersion`)
- Sección `Rules` (como `CheckBootstrapVersion`)

**Ejemplo de estructura correcta**:
```json
{
  "Resources": {
    "TableCD117FA1": {
      "Type": "AWS::DynamoDB::Table",
      "Properties": {
        "TableName": "amber-data-<su-nombre>",
        "BillingMode": "PAY_PER_REQUEST",
        "AttributeDefinitions": [
          {
            "AttributeName": "PK",
            "AttributeType": "S"
          }
        ],
        "KeySchema": [
          {
            "AttributeName": "PK",
            "KeyType": "HASH"
          }
        ]
      }
    }
  }
}
```

**Contenido esperado de AmberMonolithStack-<su-nombre>-clean.template.json**:

La plantilla limpia del Stack de origen debe contener:
- **Sección `Resources`**: Vacía (`{}`) o sin la definición de la tabla DynamoDB

La plantilla NO debe contener:
- Recurso `CDKMetadata`
- Sección `Conditions`
- Sección `Parameters`
- Sección `Rules`

**Ejemplo de estructura correcta**:
```json
{
  "Resources": {}
}
```

**¿Por qué esta estructura es necesaria?**

CloudFormation Stack Refactoring con `--enable-stack-creation` valida estrictamente que las plantillas contengan SOLO cambios relacionados con la migración de recursos. Cualquier sección adicional (`Conditions`, `Parameters`, `Rules`) o recursos no relacionados (`CDKMetadata`) se interpretan como "modificaciones no permitidas" y causan el error:

```
Found an action type that is not permitted during refactor operations: Modify
```

Al usar plantillas limpias con SOLO la sección `Resources`, garantizamos que CloudFormation pueda ejecutar el Stack Refactoring sin errores de validación.

**✓ Verificación visual**: Abra las plantillas limpias en su editor de texto y confirme que:
1. AmberDataStack-<su-nombre>-clean.template.json contiene SOLO `Resources` con la tabla DynamoDB
2. AmberMonolithStack-<su-nombre>-clean.template.json contiene SOLO `Resources` vacío o sin tabla
3. Ninguna plantilla contiene `CDKMetadata`, `Conditions`, `Parameters` o `Rules`

Una vez confirmado el contenido correcto de las plantillas limpias, puede continuar con el Paso 6 para extraer los Logical IDs.

### Concepto: ¿Qué es un Logical ID?

Antes de continuar con la extracción de Logical IDs, es importante entender este concepto fundamental de CloudFormation.

**Definición**: Un Logical ID es el identificador único de un recurso dentro de una plantilla de CloudFormation. Es el nombre que se usa en la sección `Resources` de la plantilla para referenciar el recurso.

**Ejemplo en una plantilla CloudFormation**:
```json
{
  "Resources": {
    "TableCD117FA1": {
      "Type": "AWS::DynamoDB::Table",
      "Properties": {
        "TableName": "amber-data-luis",
        ...
      }
    }
  }
}
```

En este ejemplo, `TableCD117FA1` es el Logical ID de la tabla DynamoDB.

**Importancia para Stack Refactoring**: El Logical ID es crucial para el proceso de Stack Refactoring porque:
1. **Mapeo entre Stacks**: CloudFormation necesita saber exactamente qué recurso del Stack de origen corresponde a qué recurso del Stack de destino
2. **Identificación precisa**: El Logical ID permite identificar recursos de forma inequívoca, incluso cuando múltiples recursos del mismo tipo existen en un Stack
3. **Preservación de estado**: El mapeo correcto garantiza que el recurso físico (la tabla DynamoDB real) se transfiera sin destrucción

**Cómo CDK genera el Logical ID**: AWS CDK genera Logical IDs de forma determinística basándose en:
1. **Construct tree path**: La jerarquía de Constructs en el código CDK
2. **Construct ID**: El identificador que proporcionas al crear el Construct (ej: `'Table'`)
3. **Hash suffix**: Un sufijo hash calculado a partir del path completo (ej: `CD117FA1`)

**Ejemplo en código CDK**:
```typescript
new dynamodb.Table(this, 'Table', {  // 'Table' es el Construct ID
  tableName: `amber-data-${participantName}`,
  ...
});
```

CDK genera el Logical ID: `TableCD117FA1` (donde `CD117FA1` es el hash del path del Construct).

**Propiedad determinística**: Si usas el mismo Construct ID (`'Table'`) en el mismo path del Construct tree en ambos Stacks, CDK generará el mismo Logical ID. Esto es esencial para que el Stack Refactoring funcione correctamente, ya que CloudFormation puede identificar que ambos Logical IDs representan el mismo recurso lógico.

### Paso 6: Extraer Logical ID de la plantilla

Para crear el archivo de mapeo del Stack Refactoring, necesitamos identificar el Logical ID de la tabla DynamoDB. Como eliminamos la tabla del código de AmberMonolithStack en el Paso 5, solo la encontraremos en la plantilla de AmberDataStack.

**Nota importante**: Aunque la tabla ya no está en el código de AmberMonolithStack, el Stack desplegado en AWS **SÍ tiene la tabla física**. El mapeo usará el mismo Logical ID que tenía originalmente, el cual debe coincidir con el Logical ID en AmberDataStack.

1. Extraiga el Logical ID de la tabla en el Stack de destino (AmberDataStack):
   
   **Bash:**
   ```bash
   cat cdk.out/AmberDataStack-<su-nombre>.template.json | grep -A 5 '"Type": "AWS::DynamoDB::Table"'
   ```

   **Alternativa con jq**:
   ```bash
   cat cdk.out/AmberDataStack-<su-nombre>.template.json | jq -r '.Resources | to_entries[] | select(.value.Type == "AWS::DynamoDB::Table") | .key'
   ```
   
   **PowerShell:**
   ```powershell
   Get-Content cdk.out/AmberDataStack-<su-nombre>.template.json | Select-String -Pattern '"Type":\s*"AWS::DynamoDB::Table"' -Context 5,0
   ```
   
   **Alternativa con ConvertFrom-Json**:
   ```powershell
   $template = Get-Content cdk.out/AmberDataStack-<su-nombre>.template.json | ConvertFrom-Json
   $template.Resources.PSObject.Properties | Where-Object { $_.Value.Type -eq "AWS::DynamoDB::Table" } | Select-Object -ExpandProperty Name
   ```

2. Anote el Logical ID. Debería ser algo como `TableCD117FA1`.

   **Explicación**: Este Logical ID es el mismo que tenía la tabla cuando estaba en AmberMonolithStack, porque CDK usa el mismo Construct ID (`'Table'`) en ambos casos. El sufijo hash (`CD117FA1`) es determinístico basado en el Construct tree path.

3. **Verificación opcional**: Si desea confirmar que el Logical ID es correcto, puede consultar el Stack desplegado en AWS:
   
   **Bash:**
   ```bash
   aws cloudformation describe-stack-resources --profile <nombre-perfil> \
     --stack-name AmberMonolithStack-<su-nombre> \
     --query 'StackResources[?ResourceType==`AWS::DynamoDB::Table`].LogicalResourceId' \
     --output text
   ```
   
   **PowerShell:**
   ```powershell
   aws cloudformation describe-stack-resources --profile <nombre-perfil> `
     --stack-name AmberMonolithStack-<su-nombre> `
     --query 'StackResources[?ResourceType==`AWS::DynamoDB::Table`].LogicalResourceId' `
     --output text
   ```
   
   Este comando muestra el Logical ID que tiene actualmente la tabla en el Stack desplegado. Debe coincidir con el que extrajo de AmberDataStack.

### Paso 7: Crear archivo de mapeo

El archivo de mapeo define qué recursos se moverán desde el Stack de origen hacia el Stack de destino.

1. Navegue al directorio raíz del laboratorio:
   ```bash
   cd ..
   ```

2. Abra el archivo `refactor-mapping.json` en su editor de texto.

3. Reemplace los placeholders con los valores reales:
   - Reemplace `{nombre-participante}` con su nombre de participante en ambos Stack names
   - Reemplace `{logical-id-tabla}` con el Logical ID real que extrajo en el Paso 6

   El archivo debe quedar similar a esto:
   ```json
   [
     {
       "Source": {
         "StackName": "AmberMonolithStack-<su-nombre>",
         "LogicalResourceId": "<logical-id-extraido>"
       },
       "Destination": {
         "StackName": "AmberDataStack-<su-nombre>",
         "LogicalResourceId": "<logical-id-extraido>"
       }
     }
   ]
   ```

4. Guarde el archivo.

**✓ Verificación**: Valide la sintaxis JSON:

**Bash:**
```bash
cat refactor-mapping.json | python3 -c "import sys, json; json.load(sys.stdin); print('JSON válido')"
```

**PowerShell:**
```powershell
Get-Content refactor-mapping.json | ConvertFrom-Json | Out-Null; Write-Output "JSON válido"
```

Debe mostrar: `JSON válido`

### Concepto: ¿Qué es un Refactor Set?

Antes de crear el Refactor Set, es importante entender qué es y cómo funciona este componente clave del Stack Refactoring.

**Definición**: Un Refactor Set es un artefacto de AWS CloudFormation que orquesta la migración de recursos entre Stacks de forma segura y atómica. Actúa como un plan de migración que define qué recursos se moverán, desde qué Stack de origen, hacia qué Stack de destino.

**¿Cómo funciona?**

El Refactor Set opera en dos fases:

1. **Fase de Creación** (`create-stack-refactor`):
   - CloudFormation analiza las plantillas de ambos Stacks (origen y destino)
   - Valida que el mapeo de recursos sea correcto
   - Verifica que los recursos físicos existan y sean compatibles
   - Crea un plan de migración detallado
   - NO realiza cambios en los recursos físicos todavía

2. **Fase de Ejecución** (`execute-stack-refactor`):
   - CloudFormation ejecuta el plan de migración de forma atómica
   - Transfiere la gestión del recurso físico del Stack de origen al Stack de destino
   - Actualiza los metadatos de CloudFormation sin destruir ni recrear el recurso
   - Garantiza que la operación sea reversible en caso de error

**Estados posibles del Refactor Set**:

Durante el ciclo de vida del Refactor Set, puede pasar por los siguientes estados:

- `CREATE_IN_PROGRESS`: CloudFormation está creando el Refactor Set y validando el plan de migración
- `CREATE_COMPLETE` o `AVAILABLE`: El Refactor Set está listo para ser ejecutado
- `EXECUTE_IN_PROGRESS`: La migración de recursos está en curso
- `EXECUTE_COMPLETE`: La migración se completó exitosamente
- `EXECUTE_FAILED`: La migración falló (el Refactor Set puede ser reintentado)

**Ventajas del Refactor Set**:

1. **Operación atómica**: La migración se completa totalmente o se revierte totalmente, sin estados intermedios inconsistentes
2. **Zero-Downtime**: Los recursos físicos permanecen activos durante toda la operación
3. **Preservación de datos**: Los recursos con estado (como DynamoDB) mantienen todos sus datos
4. **Validación previa**: CloudFormation valida el plan antes de ejecutarlo, reduciendo el riesgo de errores
5. **Reversibilidad**: Si la ejecución falla, el estado anterior se mantiene intacto

**Analogía**: Piense en el Refactor Set como un "contrato de transferencia" de recursos entre Stacks. Primero se redacta el contrato (fase de creación), se valida que todo esté correcto, y luego se ejecuta la transferencia (fase de ejecución). Si algo falla durante la ejecución, el contrato se anula y los recursos permanecen en su Stack original.

### Paso 8: Crear Refactor Set

Ahora crearemos el Refactor Set que orquestará la migración de la tabla DynamoDB entre Stacks.

**⚠️ Nota importante sobre plantillas limpias**: En este paso usaremos las plantillas limpias (`*-clean.template.json`) que creamos en el Paso 5.5, NO las plantillas CDK originales. Esto es necesario porque:

1. **CloudFormation Stack Refactoring con `--enable-stack-creation` solo permite cambios en la sección `Resources`**: Cualquier modificación en otras secciones (`Parameters`, `Conditions`, `Rules`) o recursos no relacionados con la migración causa el error "Found an action type that is not permitted during refactor operations: Modify"

2. **Las plantillas limpias contienen SOLO la sección `Resources`**: Eliminamos `CDKMetadata`, `Conditions`, `Parameters` y `Rules` para garantizar que CloudFormation interprete las plantillas como cambios exclusivos de migración de recursos

3. **Esto evita errores de validación durante el Stack Refactoring**: Al usar plantillas con solo `Resources`, CloudFormation puede ejecutar la migración sin detectar "modificaciones no permitidas"

Si intentara usar las plantillas CDK originales (con `CDKMetadata`, `Conditions`, etc.), el comando `create-stack-refactor` fallaría con un error de validación.

1. Asegúrese de estar en el directorio raíz del laboratorio (`lab-1-stack-refactoring`):
   ```bash
   pwd
   ```
   
   Debe mostrar: `.../lab-1-stack-refactoring`
   
   Si no está en el directorio correcto, navegue a él:
   ```bash
   cd lab-1-stack-refactoring
   ```

2. Verifique que está en el directorio correcto antes de ejecutar el comando con rutas `file://`:
   ```bash
   pwd
   ```
   
   Debe mostrar: `.../lab-1-stack-refactoring`

3. Ejecute el siguiente comando para crear el Refactor Set:
   
   **Bash:**
   ```bash
   aws cloudformation create-stack-refactor --profile <nombre-perfil> \
     --description "Migrar DynamoDB de MonolithStack a DataStack - <su-nombre>" \
     --enable-stack-creation \
     --resource-mappings file://refactor-mapping.json \
     --stack-definitions \
       StackName=AmberMonolithStack-<su-nombre>,TemplateBody@=file://AmberMonolithStack-<su-nombre>-clean.template.json \
       StackName=AmberDataStack-<su-nombre>,TemplateBody@=file://AmberDataStack-<su-nombre>-clean.template.json
   ```
   
   **PowerShell:**
   ```powershell
   aws cloudformation create-stack-refactor --profile <nombre-perfil> `
     --description "Migrar DynamoDB de MonolithStack a DataStack - <su-nombre>" `
     --enable-stack-creation `
     --resource-mappings file://refactor-mapping.json `
     --stack-definitions `
       StackName=AmberMonolithStack-<su-nombre>,TemplateBody@=file://AmberMonolithStack-<su-nombre>-clean.template.json `
       StackName=AmberDataStack-<su-nombre>,TemplateBody@=file://AmberDataStack-<su-nombre>-clean.template.json
   ```

   **Parámetros importantes**:
   - `--description`: Descripción del Refactor Set
   - `--enable-stack-creation`: Permite crear el Stack de destino si no existe
   - `--resource-mappings`: Archivo JSON que define qué recursos mover
   - `--stack-definitions`: Plantillas actualizadas de ambos Stacks
   - `TemplateBody@=file://`: El operador `@=` indica a AWS CLI que debe leer el contenido del archivo y pasarlo como valor del parámetro

   ⚠️ **Nota sobre comandos multi-línea**: Si copia y pega el comando, asegúrese de que NO haya espacios después de los caracteres de continuación de línea (`\` en Bash o `` ` `` en PowerShell). Los espacios adicionales pueden causar errores de sintaxis.

   **Alternativa usando archivo JSON** (para evitar problemas de escape en comandos largos):
   
   Puede crear un archivo `stack-definitions.json` con el siguiente contenido:
   ```json
   [
     {
       "StackName": "AmberMonolithStack-<su-nombre>",
       "TemplateBody": "<contenido-de-la-plantilla-monolith>"
     },
     {
       "StackName": "AmberDataStack-<su-nombre>",
       "TemplateBody": "<contenido-de-la-plantilla-data>"
     }
   ]
   ```
   
   Y luego ejecutar:
   
   **Bash:**
   ```bash
   aws cloudformation create-stack-refactor --profile <nombre-perfil> \
     --description "Migrar DynamoDB de MonolithStack a DataStack - <su-nombre>" \
     --enable-stack-creation \
     --resource-mappings file://refactor-mapping.json \
     --stack-definitions file://stack-definitions.json
   ```
   
   **PowerShell:**
   ```powershell
   aws cloudformation create-stack-refactor --profile <nombre-perfil> `
     --description "Migrar DynamoDB de MonolithStack a DataStack - <su-nombre>" `
     --enable-stack-creation `
     --resource-mappings file://refactor-mapping.json `
     --stack-definitions file://stack-definitions.json
   ```

4. El comando retornará un ID del Refactor Set. Anótelo para el siguiente paso.

**✓ Verificación**: Verifique el estado del Refactor Set:

**Bash:**
```bash
aws cloudformation describe-stack-refactor --profile <nombre-perfil> \
  --stack-refactor-id <refactor-set-id> \
  --query 'Status'
```

**PowerShell:**
```powershell
aws cloudformation describe-stack-refactor --profile <nombre-perfil> `
  --stack-refactor-id <refactor-set-id> `
  --query 'Status'
```

Debe mostrar: `"CREATE_COMPLETE"` o `"AVAILABLE"`

Si el estado es `CREATE_IN_PROGRESS`, espere unos segundos y vuelva a verificar.

### Paso 9: Ejecutar Stack Refactoring

Ahora ejecutaremos el Refactor Set para completar la migración atómica del recurso.

1. Ejecute el siguiente comando:
   
   **Bash:**
   ```bash
   aws cloudformation execute-stack-refactor --profile <nombre-perfil> \
     --stack-refactor-id <refactor-set-id>
   ```
   
   **PowerShell:**
   ```powershell
   aws cloudformation execute-stack-refactor --profile <nombre-perfil> `
     --stack-refactor-id <refactor-set-id>
   ```

   Reemplace `<refactor-set-id>` con el ID que obtuvo en el Paso 8.

2. Monitoree el progreso de la ejecución:
   
   **Bash:**
   ```bash
   aws cloudformation describe-stack-refactor --profile <nombre-perfil> \
     --stack-refactor-id <refactor-set-id> \
     --query 'Status'
   ```
   
   **PowerShell:**
   ```powershell
   aws cloudformation describe-stack-refactor --profile <nombre-perfil> `
     --stack-refactor-id <refactor-set-id> `
     --query 'Status'
   ```

   Estados posibles:
   - `EXECUTE_IN_PROGRESS`: La migración está en curso
   - `EXECUTE_COMPLETE`: La migración se completó exitosamente
   - `EXECUTE_FAILED`: La migración falló

⏱️ **Tiempo estimado**: La operación tarda aproximadamente 2-3 minutos.

**✓ Verificación**: Confirme que la ejecución se completó:

**Bash:**
```bash
aws cloudformation describe-stack-refactor --profile <nombre-perfil> \
  --stack-refactor-id <refactor-set-id> \
  --query 'Status'
```

**PowerShell:**
```powershell
aws cloudformation describe-stack-refactor --profile <nombre-perfil> `
  --stack-refactor-id <refactor-set-id> `
  --query 'Status'
```

Debe mostrar: `"EXECUTE_COMPLETE"`

### Paso 10: Verificar migración exitosa

Ahora verificaremos que la tabla DynamoDB fue transferida exitosamente al nuevo Stack y que los datos persisten.

1. Liste los recursos del Stack de destino (AmberDataStack):
   
   **Bash:**
   ```bash
   aws cloudformation list-stack-resources --profile <nombre-perfil> \
     --stack-name AmberDataStack-<su-nombre> \
     --query 'StackResourceSummaries[?ResourceType==`AWS::DynamoDB::Table`].[LogicalResourceId,PhysicalResourceId,ResourceStatus]' \
     --output table
   ```
   
   **PowerShell:**
   ```powershell
   aws cloudformation list-stack-resources --profile <nombre-perfil> `
     --stack-name AmberDataStack-<su-nombre> `
     --query 'StackResourceSummaries[?ResourceType==`AWS::DynamoDB::Table`].[LogicalResourceId,PhysicalResourceId,ResourceStatus]' `
     --output table
   ```

   **✓ Verificación**: La tabla DynamoDB debe aparecer en este Stack.

2. Verifique que la tabla NO aparece en el Stack de origen (AmberMonolithStack):
   
   **Bash:**
   ```bash
   aws cloudformation list-stack-resources --profile <nombre-perfil> \
     --stack-name AmberMonolithStack-<su-nombre> \
     --query 'StackResourceSummaries[?ResourceType==`AWS::DynamoDB::Table`].[LogicalResourceId,PhysicalResourceId,ResourceStatus]' \
     --output table
   ```
   
   **PowerShell:**
   ```powershell
   aws cloudformation list-stack-resources --profile <nombre-perfil> `
     --stack-name AmberMonolithStack-<su-nombre> `
     --query 'StackResourceSummaries[?ResourceType==`AWS::DynamoDB::Table`].[LogicalResourceId,PhysicalResourceId,ResourceStatus]' `
     --output table
   ```

   **✓ Verificación**: No debe haber recursos de tipo DynamoDB en este Stack.

3. Verifique que el Physical ID de la tabla no cambió:
   
   **Bash:**
   ```bash
   aws dynamodb describe-table --profile <nombre-perfil> \
     --table-name amber-data-<su-nombre> \
     --query 'Table.[TableName,TableArn,CreationDateTime]' \
     --output table
   ```
   
   **PowerShell:**
   ```powershell
   aws dynamodb describe-table --profile <nombre-perfil> `
     --table-name amber-data-<su-nombre> `
     --query 'Table.[TableName,TableArn,CreationDateTime]' `
     --output table
   ```

   El nombre de la tabla y el ARN deben ser los mismos que antes del Stack Refactoring.

4. Verifique que el dato de prueba persiste:
   
   **Bash:**
   ```bash
   bash scripts/verify-data.sh <su-nombre>
   ```
   
   **PowerShell:**
   ```powershell
   .\scripts\verify-data.ps1 <su-nombre> -Profile <nombre-perfil>
   ```
   
   **Nota**: Si no usa AWS SSO, puede omitir el parámetro `-Profile` en PowerShell.

   **Alternativa con AWS CLI directo**:
   
   **Bash:**
   ```bash
   aws dynamodb get-item --profile <nombre-perfil> \
     --table-name amber-data-<su-nombre> \
     --key '{"PK": {"S": "TEST#001"}}' \
     --query 'Item'
   ```
   
   **PowerShell:**
   ```powershell
   aws dynamodb get-item --profile <nombre-perfil> `
     --table-name amber-data-<su-nombre> `
     --key '{\"PK\": {\"S\": \"TEST#001\"}}' `
     --query 'Item'
   ```

   **✓ Verificación**: El registro insertado en el Paso 4 debe estar presente sin modificaciones.

**Resultado esperado**: La tabla DynamoDB ahora es gestionada por AmberDataStack, pero el recurso físico (tabla) no fue destruido ni recreado. Los datos persisten intactos, logrando una migración Zero-Downtime.

### Paso 11: Despliegue post-refactoring

Finalmente, ejecutaremos `cdk deploy` para confirmar que CDK reconoce la nueva estructura y no intenta recrear recursos.

1. Navegue al directorio del proyecto CDK:
   ```bash
   cd cdk-app
   ```

2. Ejecute `cdk deploy` en ambos Stacks:
   ```bash
   cdk deploy --all -c participantName=<su-nombre> --profile <nombre-perfil>
   ```

3. Observe el output del comando. CDK debe detectar que no hay cambios pendientes en los recursos físicos.

**✓ Verificación**: El output debe mostrar algo similar a:

```
AmberMonolithStack-<su-nombre>: no changes
AmberDataStack-<su-nombre>: no changes
```

**Explicación**: CDK no intenta recrear la tabla DynamoDB porque:
1. El Stack Refactoring ya transfirió la gestión del recurso físico a AmberDataStack
2. La definición del recurso en el código CDK coincide con el estado actual en AWS
3. El Physical ID de la tabla permanece sin cambios

**✓ Verificación final**: Confirme el estado de ambos Stacks:

**Bash:**
```bash
aws cloudformation describe-stacks --profile <nombre-perfil> \
  --stack-name AmberMonolithStack-<su-nombre> \
  --query 'Stacks[0].StackStatus'

aws cloudformation describe-stacks --profile <nombre-perfil> \
  --stack-name AmberDataStack-<su-nombre> \
  --query 'Stacks[0].StackStatus'
```

**PowerShell:**
```powershell
aws cloudformation describe-stacks --profile <nombre-perfil> `
  --stack-name AmberMonolithStack-<su-nombre> `
  --query 'Stacks[0].StackStatus'

aws cloudformation describe-stacks --profile <nombre-perfil> `
  --stack-name AmberDataStack-<su-nombre> `
  --query 'Stacks[0].StackStatus'
```

Ambos deben mostrar: `"UPDATE_COMPLETE"` o `"CREATE_COMPLETE"`

## Limpieza

⚠️ **ADVERTENCIA CRÍTICA**: NO elimine los recursos creados en este laboratorio.

Los recursos creados (AmberMonolithStack, AmberDataStack y la tabla DynamoDB) serán utilizados en los Laboratorios 2 y 3 del workshop. Eliminarlos ahora interrumpirá el flujo del workshop y requerirá recrearlos.

### Ciclo de Vida de Recursos

- **Durante el workshop**: Mantenga todos los recursos activos
- **Al finalizar los 3 laboratorios**: Consulte el archivo [LIMPIEZA.md](../LIMPIEZA.md) en la raíz del repositorio para instrucciones de limpieza completa

### Costos Estimados

Los recursos de este laboratorio generan costos mínimos:
- **DynamoDB**: Modo PAY_PER_REQUEST sin datos significativos (~$0.00/día)
- **CloudFormation**: Sin costo adicional

## Solución de Problemas

Si encuentra dificultades durante este laboratorio, consulte la [Guía de Solución de Problemas](../TROUBLESHOOTING.md) que contiene soluciones a errores comunes.

**Errores que requieren asistencia del instructor:**
- Errores de permisos IAM (`AccessDenied`, `UnauthorizedAccess`)
- Errores de límites de cuota de AWS
- Errores de región o configuración de cuenta

Para otros errores comunes (sintaxis JSON, Logical IDs incorrectos, estados del Refactor Set), consulte el documento de troubleshooting.
