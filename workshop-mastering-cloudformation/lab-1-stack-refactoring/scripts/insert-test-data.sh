#!/bin/bash
# Script para insertar dato de prueba en la tabla DynamoDB
# Uso: ./insert-test-data.sh <nombre-participante>

PARTICIPANT_NAME="${1:?Uso: ./insert-test-data.sh <nombre-participante>}"
TABLE_NAME="amber-data-${PARTICIPANT_NAME}"

echo "Insertando dato de prueba en la tabla ${TABLE_NAME}..."

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK": {"S": "TEST#001"},
    "data": {"S": "Registro de prueba - Stack Refactoring Lab"},
    "timestamp": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}
  }'

if [ $? -eq 0 ]; then
  echo "✓ Item insertado exitosamente en la tabla ${TABLE_NAME}"
else
  echo "✗ Error al insertar el item. Verifique que la tabla existe y tiene los permisos correctos."
  exit 1
fi
