# Scripts de Utilidad para Stack Refactoring

Este directorio contiene scripts de utilidad para el Laboratorio 1 de Stack Refactoring.

## clean-cdk-template.sh

Script Bash para limpiar plantillas de CloudFormation generadas por AWS CDK, eliminando secciones que causan errores durante operaciones de Stack Refactoring.

### Requisitos

- Bash shell (Linux, macOS, o WSL en Windows)
- `jq` instalado:
  - Ubuntu/Debian: `sudo apt-get install jq`
  - macOS: `brew install jq`
  - Windows (WSL): `sudo apt-get install jq`

### Uso

```bash
./clean-cdk-template.sh <ruta-plantilla-cdk>
```

### Ejemplo

```bash
# Desde el directorio raíz del laboratorio
./scripts/clean-cdk-template.sh cdk-app/cdk.out/AmberDataStack-{nombre-participante}.template.json
```

### Qué hace el script

El script elimina las siguientes secciones de la plantilla CDK:

1. **Recurso CDKMetadata**: Elimina el recurso `CDKMetadata` de tipo `AWS::CDK::Metadata`
2. **Sección Conditions**: Elimina la sección completa `Conditions`
3. **Sección Parameters**: Elimina la sección completa `Parameters`
4. **Sección Rules**: Elimina la sección completa `Rules`

El script preserva:
- La sección `Resources` con todos los recursos de aplicación (excepto `CDKMetadata`)

### Salida

El script genera un archivo con el sufijo `-clean.template.json` en el directorio actual:

```
AmberDataStack-{nombre-participante}-clean.template.json
```

### Validaciones

El script incluye las siguientes validaciones:

- Verifica que se proporcionó un argumento
- Verifica que el archivo de entrada existe
- Verifica que `jq` está instalado
- Verifica que el archivo de entrada es JSON válido
- Verifica que el archivo de salida es JSON válido
- Advierte si la plantilla limpia no contiene una sección `Resources`

### Manejo de Errores

Si ocurre un error, el script muestra un mensaje descriptivo y termina con código de salida 1:

- **Error: Debe proporcionar la ruta de la plantilla CDK como argumento**
  - Solución: Ejecute el script con la ruta de la plantilla como argumento

- **Error: El archivo 'ruta' no existe**
  - Solución: Verifique que la ruta del archivo es correcta

- **Error: jq no está instalado**
  - Solución: Instale `jq` usando el gestor de paquetes de su sistema

- **Error: El archivo 'ruta' no contiene JSON válido**
  - Solución: Verifique que el archivo de entrada es una plantilla JSON válida

- **Error: El JSON generado no es válido**
  - Solución: Revise el archivo de entrada, puede estar corrupto

## Otros Scripts

### insert-test-data.sh / insert-test-data.ps1

Scripts para insertar datos de prueba en la tabla DynamoDB.

### verify-data.sh / verify-data.ps1

Scripts para verificar que los datos persisten en la tabla DynamoDB después del Stack Refactoring.
