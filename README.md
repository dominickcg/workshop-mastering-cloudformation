# ☁️ Workshop: Mastering CloudFormation - Team Technology Amber

## Visión General

Bienvenido al workshop de funcionalidades avanzadas de AWS CloudFormation diseñado para el Team Technology de Amber. Este workshop de 2 horas cubre técnicas avanzadas de gestión de infraestructura como código (IaC) usando AWS CDK y CloudFormation.

## Agenda del Workshop

**Duración total**: 2 horas

| Tiempo | Laboratorio | Descripción |
|--------|-------------|-------------|
| 30 min | [Laboratorio 1: Stack Refactoring](./lab-1-stack-refactoring/) | Aprende a mover recursos con estado entre Stacks sin destrucción |
| 45 min | [Laboratorio 2: SafeDeploy Hooks](./modulo-2/lab-2-safedeploy-hooks/) | Implementa validaciones automáticas durante despliegues |
| 45 min | [Laboratorio 3: Validation & Troubleshooting](./modulo-3/lab-3-validation-troubleshooting/) | Técnicas avanzadas de validación y resolución de problemas |

## Objetivos de Aprendizaje

Al completar este workshop, serás capaz de:

- Ejecutar migraciones Zero-Downtime usando Stack Refactoring de CloudFormation
- Implementar SafeDeploy Hooks para validar cambios antes del despliegue
- Aplicar técnicas avanzadas de troubleshooting en infraestructura CloudFormation
- Combinar AWS CDK con AWS CLI para operaciones avanzadas de IaC

## Prerrequisitos Generales

### Conocimientos Requeridos
- Nivel AWS Certified Solutions Architect - Associate
- Nivel AWS Certified CloudOps Engineer - Associate
- Experiencia con AWS CDK y TypeScript
- Familiaridad con AWS CLI

### Herramientas Requeridas
- **AWS CLI**: Versión 2.x o superior
- **Node.js**: Versión 18.x o superior
- **npm**: Incluido con Node.js
- **AWS CDK CLI**: Versión 2.x o superior
- **Credenciales AWS**: Configuradas con permisos adecuados

### Verificación de Instalación

```bash
# Verificar AWS CLI
aws --version

# Verificar Node.js y npm
node --version
npm --version

# Verificar AWS CDK CLI
cdk --version

# Verificar credenciales AWS
aws sts get-caller-identity
```

## Estructura del Repositorio

```
.
├── README.md                          # Este archivo
├── TROUBLESHOOTING.md                 # Guía de solución de problemas
├── LIMPIEZA.md                        # Instrucciones de limpieza post-workshop
├── CONTRIBUTING.md                    # Guía de contribución
├── .gitignore                         # Archivos excluidos del repositorio
├── lab-1-stack-refactoring/           # Laboratorio 1: Stack Refactoring
├── modulo-2/                          # Laboratorio 2: SafeDeploy Hooks
└── modulo-3/                          # Laboratorio 3: Validation & Troubleshooting
```

## Recursos Adicionales

- [Guía de Solución de Problemas](./TROUBLESHOOTING.md)
- [Instrucciones de Limpieza](./LIMPIEZA.md)

## Configuración Inicial del Repositorio

### Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd cloudformation-workshop
```

### Instalar Dependencias de CDK

Cada laboratorio que use AWS CDK requiere instalar dependencias de Node.js:

```bash
# Para el Laboratorio 1
cd lab-1-stack-refactoring/cdk-app
npm install
cd ../..
```

**Nota**: El directorio `node_modules` está excluido del repositorio mediante `.gitignore` para evitar problemas con rutas largas en Windows y reducir el tamaño del repositorio. Los participantes deben ejecutar `npm install` localmente.

## Notas Importantes

⚠️ **Importante**: Los recursos creados en cada laboratorio pueden ser utilizados en laboratorios posteriores. Consulte las instrucciones de limpieza específicas de cada laboratorio antes de eliminar recursos.

⚠️ **Costos**: Este workshop utiliza servicios de AWS que pueden generar costos. Asegúrese de seguir las instrucciones de limpieza al finalizar para evitar cargos innecesarios.

⚠️ **Rutas largas en Windows**: Si encuentra errores relacionados con rutas de archivo demasiado largas, habilite el soporte para rutas largas en Windows ejecutando como administrador:
```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```
