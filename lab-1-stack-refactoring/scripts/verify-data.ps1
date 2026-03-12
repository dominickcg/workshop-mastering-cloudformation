# Script para verificar que el dato de prueba persiste después del Stack Refactoring
# Uso: .\verify-data.ps1 -ParticipantName <nombre-participante>

param(
    [Parameter(Mandatory=$true, HelpMessage="Ingrese su nombre de participante")]
    [string]$ParticipantName
)

$TableName = "amber-data-$ParticipantName"

Write-Host "Verificando dato de prueba en la tabla $TableName..." -ForegroundColor Cyan
Write-Host ""

try {
    $Result = aws dynamodb get-item `
        --table-name $TableName `
        --key '{\"PK\": {\"S\": \"TEST#001\"}}' `
        --query 'Item' `
        --output json 2>&1

    if ($LASTEXITCODE -eq 0 -and $Result -ne "null" -and $Result) {
        Write-Host "✓ Dato encontrado:" -ForegroundColor Green
        
        # Convertir JSON y formatear para mejor legibilidad
        $JsonObject = $Result | ConvertFrom-Json
        $JsonObject | ConvertTo-Json -Depth 10
        
        Write-Host ""
        Write-Host "✓ La migración fue exitosa. El dato persiste sin modificaciones." -ForegroundColor Green
    }
    else {
        Write-Host "✗ No se encontró el dato de prueba. Verifique que:" -ForegroundColor Red
        Write-Host "  1. La tabla $TableName existe" -ForegroundColor Yellow
        Write-Host "  2. El item TEST#001 fue insertado correctamente" -ForegroundColor Yellow
        Write-Host "  3. El Stack Refactoring se completó exitosamente" -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host "✗ Error al ejecutar el comando:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique que:" -ForegroundColor Yellow
    Write-Host "  1. AWS CLI está instalado y configurado correctamente" -ForegroundColor Yellow
    Write-Host "  2. Tiene permisos para acceder a DynamoDB" -ForegroundColor Yellow
    Write-Host "  3. La región configurada es la correcta" -ForegroundColor Yellow
    exit 1
}
