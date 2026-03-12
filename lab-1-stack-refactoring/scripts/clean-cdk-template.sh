#!/bin/bash

# Script para limpiar plantillas de CloudFormation generadas por AWS CDK
# Elimina secciones problemáticas que causan errores durante Stack Refactoring
# Uso: ./clean-cdk-template.sh <ruta-plantilla-cdk>

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes de error
error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Función para mostrar mensajes de éxito
success() {
    echo -e "${GREEN}$1${NC}"
}

# Función para mostrar mensajes de advertencia
warning() {
    echo -e "${YELLOW}$1${NC}"
}

# Verificar que se proporcionó un argumento
if [ $# -eq 0 ]; then
    error "Debe proporcionar la ruta de la plantilla CDK como argumento.\nUso: $0 <ruta-plantilla-cdk>"
fi

TEMPLATE_PATH="$1"

# Verificar que el archivo existe
if [ ! -f "$TEMPLATE_PATH" ]; then
    error "El archivo '$TEMPLATE_PATH' no existe."
fi

# Verificar que jq está instalado
if ! command -v jq &> /dev/null; then
    error "jq no está instalado. Por favor instale jq para continuar.\nEn Ubuntu/Debian: sudo apt-get install jq\nEn macOS: brew install jq"
fi

# Verificar que el archivo es JSON válido
if ! jq empty "$TEMPLATE_PATH" 2>/dev/null; then
    error "El archivo '$TEMPLATE_PATH' no contiene JSON válido."
fi

# Generar nombre del archivo de salida (en el directorio actual)
TEMPLATE_FILENAME=$(basename "$TEMPLATE_PATH")
TEMPLATE_NAME="${TEMPLATE_FILENAME%.template.json}"
OUTPUT_PATH="${TEMPLATE_NAME}-clean.template.json"

echo "Limpiando plantilla CDK..."
echo "Archivo de entrada: $TEMPLATE_PATH"
echo "Archivo de salida: $OUTPUT_PATH"
echo ""

# Leer la plantilla y eliminar secciones problemáticas
jq '
  # Eliminar recurso CDKMetadata de la sección Resources
  if .Resources then
    .Resources |= del(.CDKMetadata)
  else
    .
  end |
  
  # Eliminar sección Conditions
  del(.Conditions) |
  
  # Eliminar sección Parameters
  del(.Parameters) |
  
  # Eliminar sección Rules
  del(.Rules)
' "$TEMPLATE_PATH" > "$OUTPUT_PATH"

# Verificar que el JSON de salida es válido
if ! jq empty "$OUTPUT_PATH" 2>/dev/null; then
    error "El JSON generado no es válido. Por favor revise el archivo de entrada."
fi

# Verificar que la sección Resources existe
if ! jq -e '.Resources' "$OUTPUT_PATH" > /dev/null 2>&1; then
    warning "Advertencia: La plantilla limpia no contiene una sección 'Resources'."
fi

echo ""
success "✓ Plantilla limpia generada exitosamente: $OUTPUT_PATH"
echo ""
echo "Secciones eliminadas:"
echo "  - CDKMetadata (recurso)"
echo "  - Conditions (sección completa)"
echo "  - Parameters (sección completa)"
echo "  - Rules (sección completa)"
echo ""
echo "Secciones preservadas:"
echo "  - Resources (con recursos de aplicación)"
