# Script para insertar dato de prueba en la tabla DynamoDB
# Uso: .\insert-test-data.ps1 <nombre-participante> [-Profile <nombre-perfil>]

param(
    [Parameter(Mandatory=$true)]
    [string]$NombreParticipante,
    
    [Parameter(Mandatory=$false)]
    [string]$Profile
)

$TABLE_NAME = "amber-data-$NombreParticipante"
$TIMESTAMP = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"

Write-Host "Insertando dato de prueba en la tabla $TABLE_NAME..."

# Construir el JSON con escape correcto usando comillas simples y \"
$item = '{\"PK\": {\"S\": \"TEST#001\"}, \"data\": {\"S\": \"Registro de prueba - Stack Refactoring Lab\"}, \"timestamp\": {\"S\": \"' + $TIMESTAMP + '\"}}'

# Construir el comando con o sin --profile según se proporcione
if ($Profile) {
    aws dynamodb put-item `
      --profile $Profile `
      --table-name $TABLE_NAME `
      --item $item
} else {
    aws dynamodb put-item `
      --table-name $TABLE_NAME `
      --item $item
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Item insertado exitosamente en la tabla $TABLE_NAME" -ForegroundColor Green
} else {
    Write-Host "Error al insertar el item. Verifique que la tabla existe y tiene los permisos correctos." -ForegroundColor Red
    exit 1
}
