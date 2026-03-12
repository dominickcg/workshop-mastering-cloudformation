# Script para insertar dato de prueba en la tabla DynamoDB
# Uso: .\insert-test-data.ps1 <nombre-participante>

param(
    [Parameter(Mandatory=$true)]
    [string]$NombreParticipante
)

$TABLE_NAME = "amber-data-$NombreParticipante"
$TIMESTAMP = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"

Write-Host "Insertando dato de prueba en la tabla $TABLE_NAME..."

# Construir el JSON como un objeto y convertirlo a string
$item = @{
    "PK" = @{"S" = "TEST#001"}
    "data" = @{"S" = "Registro de prueba - Stack Refactoring Lab"}
    "timestamp" = @{"S" = $TIMESTAMP}
} | ConvertTo-Json -Compress

aws dynamodb put-item `
  --table-name $TABLE_NAME `
  --item $item

if ($LASTEXITCODE -eq 0) {
    Write-Host "Item insertado exitosamente en la tabla $TABLE_NAME" -ForegroundColor Green
} else {
    Write-Host "Error al insertar el item. Verifique que la tabla existe y tiene los permisos correctos." -ForegroundColor Red
    exit 1
}
