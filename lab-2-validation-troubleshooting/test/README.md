# Tests de Validación - Laboratorio 2

Este directorio contiene tests de validación para el Laboratorio 2: Early Validation & Troubleshooting.

## Configuración del Entorno de Testing

### Instalación de Dependencias

```bash
cd lab-2-validation-troubleshooting/test
npm install
```

### Estructura de Testing

Este proyecto utiliza dos enfoques complementarios de testing:

1. **Unit Tests**: Verifican contenido específico de artefactos (README, scripts, configuraciones)
2. **Property-Based Tests**: Verifican propiedades universales usando generación aleatoria con `fast-check`

## Ejecutar Tests

### Ejecutar todos los tests

```bash
npm test
```

### Ejecutar tests en modo watch

```bash
npm run test:watch
```

### Ejecutar tests con cobertura

```bash
npm run test:coverage
```

## Propiedades de Correctitud

Los property-based tests validan las siguientes propiedades:

- **Property 1**: S3 Bucket con nombre explícito genera BucketName en plantilla CDK
- **Property 2**: S3 Bucket sin nombre explícito omite BucketName en plantilla CDK
- **Property 3**: Lambda Function sintetizada con configuración correcta
- **Property 4**: Round-trip de permisos IAM (restrict → restore)
- **Property 5**: Validación de formato UUID para Operation ID
- **Property 6**: Filtro JMESPath aísla eventos fallidos
- **Property 7**: Scripts incorporan nombre de participante correctamente

## Tecnologías

- **Jest**: Framework de testing
- **fast-check**: Librería de property-based testing
- **ts-jest**: Soporte de TypeScript para Jest
- **aws-cdk-lib**: Para testing de síntesis CDK

## Notas

- Los tests de CDK (Properties 1-3) usan `cdk.assertions` para verificar plantillas sintetizadas sin desplegar a AWS
- Los property-based tests ejecutan 100 iteraciones por defecto
- Los tests son determinísticos y no requieren credenciales de AWS
