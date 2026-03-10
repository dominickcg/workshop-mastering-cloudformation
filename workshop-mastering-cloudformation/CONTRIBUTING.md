# Guía de Contribución

## Estructura del Repositorio

Este repositorio contiene materiales de laboratorio para el workshop "Mastering CloudFormation" del Team Technology de Amber.

```
workshop-mastering-cloudformation/
├── README.md                          # Documentación principal
├── TROUBLESHOOTING.md                 # Guía de solución de problemas
├── LIMPIEZA.md                        # Instrucciones de limpieza
├── .gitignore                         # Archivos excluidos del repositorio
├── lab-1-stack-refactoring/           # Laboratorio 1: Stack Refactoring
├── modulo-2/                          # Laboratorio 2: SafeDeploy Hooks
└── modulo-3/                          # Laboratorio 3: Validation & Troubleshooting
```

## Archivos Excluidos del Repositorio

Los siguientes archivos y directorios están excluidos mediante `.gitignore`:

### Dependencias de Node.js
- `node_modules/` - Dependencias de npm (se instalan con `npm install`)
- `package-lock.json` - Lock file de npm (opcional)

### Archivos Generados por CDK
- `cdk.out/` - Plantillas sintetizadas de CloudFormation
- `.cdk.staging/` - Directorio temporal de CDK
- `cdk.context.json` - Contexto de CDK (generado automáticamente)

### Archivos Compilados de TypeScript
- `*.js` - JavaScript compilado desde TypeScript
- `*.d.ts` - Archivos de definición de tipos
- `*.js.map` - Source maps

### Archivos de IDE y Sistema Operativo
- `.vscode/`, `.idea/` - Configuraciones de editores
- `.DS_Store`, `Thumbs.db` - Archivos del sistema operativo

### Archivos Sensibles
- `.env`, `.env.local` - Variables de entorno
- `**/credentials`, `**/.aws/` - Credenciales de AWS

## Agregar un Nuevo Laboratorio

1. Cree un nuevo directorio en el módulo correspondiente:
   ```bash
   mkdir -p modulo-X/lab-Y-nombre-laboratorio
   ```

2. Siga la estructura estándar:
   ```
   lab-Y-nombre-laboratorio/
   ├── README.md              # Guía paso a paso del laboratorio
   ├── cdk-app/               # Proyecto CDK (si aplica)
   ├── scripts/               # Scripts de soporte
   └── [archivos-soporte]     # Plantillas, políticas, etc.
   ```

3. Si el laboratorio usa AWS CDK:
   - Incluya `package.json` y `tsconfig.json`
   - NO incluya `node_modules/` ni `cdk.out/`
   - Agregue un `.gitignore` específico en `cdk-app/`

4. Actualice los documentos compartidos:
   - `TROUBLESHOOTING.md` - Agregue sección para el nuevo laboratorio
   - `LIMPIEZA.md` - Agregue instrucciones de limpieza
   - `README.md` principal - Agregue enlace al nuevo laboratorio

## Convenciones de Código

### TypeScript (CDK)
- Use TypeScript strict mode
- Siga las convenciones de nombres de AWS CDK
- Documente interfaces y clases públicas
- Use `RemovalPolicy.RETAIN` para recursos con estado

### Scripts Bash
- Incluya shebang: `#!/bin/bash`
- Valide argumentos requeridos
- Proporcione mensajes de error claros
- Use variables en mayúsculas para constantes

### Documentación
- Escriba en español, mantenga terminología AWS en inglés
- Use emojis solo en títulos principales
- Incluya tabla de contenidos (índice) con anchor links
- Proporcione checkpoints de verificación después de pasos críticos
- Incluya advertencias críticas destacadas con ⚠️

## Validación Antes de Commit

Antes de hacer commit de cambios:

1. **Verifique que el código CDK compila**:
   ```bash
   cd cdk-app
   npm install
   npx tsc --noEmit
   ```

2. **Valide archivos JSON**:
   ```bash
   cat archivo.json | python3 -c "import sys, json; json.load(sys.stdin)"
   ```

3. **Verifique que no incluye archivos sensibles**:
   ```bash
   git status
   # Revise que no aparezcan node_modules/, cdk.out/, o archivos .env
   ```

4. **Pruebe las instrucciones del laboratorio**:
   - Siga el README paso a paso
   - Verifique que todos los comandos funcionan
   - Confirme que los checkpoints de verificación son precisos

## Problemas Comunes

### Rutas Largas en Windows

Si encuentra errores de "ruta demasiado larga" al clonar el repositorio:

1. Habilite soporte para rutas largas (requiere permisos de administrador):
   ```powershell
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

2. Configure Git para usar rutas largas:
   ```bash
   git config --system core.longpaths true
   ```

### node_modules No Sincroniza

Esto es intencional. `node_modules` está excluido del repositorio. Los participantes deben ejecutar `npm install` localmente.

## Contacto

Para preguntas o sugerencias sobre el contenido del workshop, contacte al Team Technology de Amber.
