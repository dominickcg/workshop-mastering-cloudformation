#!/bin/bash
# Script para verificar que el dato de prueba persiste después del Stack Refactoring
# Uso: ./verify-data.sh <nombre-participante>

PARTICIPANT_NAME="${1:?Uso: ./verify-data.sh <nombre-participante>}"
TABLE_NAME="amber-data-${PARTICIPANT_NAME}"

echo "Verificando dato de prueba en la tabla ${TABLE_NAME}..."
echo ""

RESULT=$(aws dynamodb get-item \
  --table-name "${TABLE_NAME}" \
  --key '{"PK": {"S": "TEST#001"}}' \
  --query 'Item' \
  --output json)

if [ $? -eq 0 ] && [ "$RESULT" != "null" ] && [ -n "$RESULT" ]; then
  echo "✓ Dato encontrado:"
  echo "$RESULT" | jq '.'
  echo ""
  echo "✓ La migración fue exitosa. El dato persiste sin modificaciones."
else
  echo "✗ No se encontró el dato de prueba. Verifique que:"
  echo "  1. La tabla ${TABLE_NAME} existe"
  echo "  2. El item TEST#001 fue insertado correctamente"
  echo "  3. El Stack Refactoring se completó exitosamente"
  exit 1
fi
