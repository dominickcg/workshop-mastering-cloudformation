# 🧹 Limpieza de Recursos - Workshop: Mastering CloudFormation

⚠️ **IMPORTANTE**: Realice esta limpieza SOLO al finalizar los 3 laboratorios del workshop. NO elimine recursos entre laboratorios.

Este documento contiene instrucciones para eliminar todos los recursos creados durante el workshop y evitar cargos innecesarios en su cuenta de AWS.

## Índice

- [Laboratorio 1: Stack Refactoring](#laboratorio-1-stack-refactoring)
- [Laboratorio 2: SafeDeploy Hooks](#laboratorio-2-safedeploy-hooks)
- [Laboratorio 3: Validation & Troubleshooting](#laboratorio-3-validation--troubleshooting)
- [Verificación Final](#verificación-final)

---

## Laboratorio 1: Stack Refactoring

### Recursos a Eliminar

1. **Stack AmberDataStack**
2. **Stack AmberMonolithStack**
3. **Tabla DynamoDB** (si no fue eliminada automáticamente)

### Procedimiento de Limpieza

#### Paso 1: Eliminar AmberDataStack

Este Stack contiene la tabla DynamoDB después del Stack Refactoring.

```bash
aws cloudformation delete-stack --stack-name AmberDataStack-<su-nombre>
```

Monitoree el progreso:
```bash
aws cloudformation describe-stacks \
  --stack-name AmberDataStack-<su-nombre> \
  --query 'Stacks[0].StackStatus'
```

Espere hasta que el estado sea `DELETE_COMPLETE` o el Stack ya no exista.

⏱️ **Tiempo estimado**: 1-2 minutos

---

#### Paso 2: Eliminar AmberMonolithStack

```bash
aws cloudformation delete-stack --stack-name AmberMonolithStack-<su-nombre>
```

Monitoree el progreso:
```bash
aws cloudformation describe-stacks \
  --stack-name AmberMonolithStack-<su-nombre> \
  --query 'Stacks[0].StackStatus'
```

Espere hasta que el estado sea `DELETE_COMPLETE` o el Stack ya no exista.

⏱️ **Tiempo estimado**: 1-2 minutos

---

#### Paso 3: Verificar y eliminar tabla DynamoDB (si persiste)

Debido a la configuración `RemovalPolicy.RETAIN`, la tabla DynamoDB puede persistir después de eliminar los Stacks.

1. Verifique si la tabla existe:
   ```bash
   aws dynamodb describe-table --table-name amber-data-<su-nombre>
   ```

2. Si la tabla existe, elimínela manualmente:
   ```bash
   aws dynamodb delete-table --table-name amber-data-<su-nombre>
   ```

3. Confirme la eliminación:
   ```bash
   aws dynamodb describe-table --table-name amber-data-<su-nombre>
   ```
   
   Debe mostrar un error indicando que la tabla no existe.

---

## Laboratorio 2: SafeDeploy Hooks

_Esta sección será completada en el spec del Laboratorio 2._

---

## Laboratorio 3: Validation & Troubleshooting

_Esta sección será completada en el spec del Laboratorio 3._

---

## Verificación Final

Después de completar la limpieza de los 3 laboratorios, verifique que no quedan recursos activos:

### Verificar Stacks de CloudFormation

```bash
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query 'StackSummaries[?contains(StackName, `Amber`)].StackName'
```

No debe mostrar ningún Stack con el prefijo `Amber`.

### Verificar Tablas DynamoDB

```bash
aws dynamodb list-tables --query 'TableNames[?contains(@, `amber-data`)]'
```

No debe mostrar ninguna tabla con el prefijo `amber-data`.

### Costos Residuales

Después de la limpieza completa, no debe haber costos residuales relacionados con este workshop. Los servicios utilizados (CloudFormation, DynamoDB en modo PAY_PER_REQUEST sin datos) no generan cargos cuando no están activos.

---

## Soporte

Si encuentra problemas durante la limpieza o tiene dudas sobre recursos residuales, consulte con el instructor del workshop.
