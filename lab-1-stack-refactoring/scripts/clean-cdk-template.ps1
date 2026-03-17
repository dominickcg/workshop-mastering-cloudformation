# Script para limpiar plantillas de CloudFormation generadas por AWS CDK
# Elimina secciones problematicas que causan errores durante Stack Refactoring
# Uso: .\clean-cdk-template.ps1 -TemplatePath <ruta-plantilla-cdk>

param(
    [Parameter(Mandatory=$true, HelpMessage="Ruta de la plantilla CDK a limpiar")]
    [string]$TemplatePath
)

# Configurar ErrorActionPreference para detener en errores
$ErrorActionPreference = "Stop"

# Funciones para mensajes con colores
function Write-ErrorMessage {
    param([string]$Message)
    Write-Host "Error: $Message" -ForegroundColor Red
    exit 1
}

function Write-SuccessMessage {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-WarningMessage {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

try {
    # Verificar que el archivo existe
    if (-not (Test-Path -Path $TemplatePath -PathType Leaf)) {
        Write-ErrorMessage "El archivo '$TemplatePath' no existe."
    }

    # Leer y parsear el archivo JSON
    Write-Host "Limpiando plantilla CDK..."
    Write-Host "Archivo de entrada: $TemplatePath"
    
    $templateContent = Get-Content -Path $TemplatePath -Raw
    
    # Intentar parsear el JSON
    try {
        $template = $templateContent | ConvertFrom-Json
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-ErrorMessage "El archivo '$TemplatePath' no contiene JSON valido. Detalle: $errorMsg"
    }

    # Generar nombre del archivo de salida (en el directorio actual)
    $templateFilename = Split-Path -Path $TemplatePath -Leaf
    $templateName = $templateFilename -replace '\.template\.json$', ''
    $outputPath = "$templateName-clean.template.json"
    
    Write-Host "Archivo de salida: $outputPath"
    Write-Host ""

    # Eliminar secciones problematicas
    
    # Eliminar recurso CDKMetadata de la seccion Resources
    if ($template.PSObject.Properties.Name -contains 'Resources') {
        if ($template.Resources.PSObject.Properties.Name -contains 'CDKMetadata') {
            $template.Resources.PSObject.Properties.Remove('CDKMetadata')
        }
    }
    
    # Eliminar seccion Conditions
    if ($template.PSObject.Properties.Name -contains 'Conditions') {
        $template.PSObject.Properties.Remove('Conditions')
    }
    
    # Eliminar seccion Parameters
    if ($template.PSObject.Properties.Name -contains 'Parameters') {
        $template.PSObject.Properties.Remove('Parameters')
    }
    
    # Eliminar seccion Rules
    if ($template.PSObject.Properties.Name -contains 'Rules') {
        $template.PSObject.Properties.Remove('Rules')
    }

    # Convertir a JSON con profundidad adecuada
    $cleanJson = $template | ConvertTo-Json -Depth 10

    # Guardar el archivo limpio (sin BOM para compatibilidad con CloudFormation)
    # PowerShell 5.1 Out-File -Encoding UTF8 agrega BOM que puede causar errores
    $outputFullPath = Join-Path -Path (Get-Location) -ChildPath $outputPath
    [System.IO.File]::WriteAllText($outputFullPath, $cleanJson, (New-Object System.Text.UTF8Encoding $false))

    # Validar que el JSON de salida es valido
    try {
        $validationTest = Get-Content -Path $outputPath -Raw | ConvertFrom-Json
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-ErrorMessage "El JSON generado no es valido. Por favor revise el archivo de entrada. Detalle: $errorMsg"
    }

    # Verificar que la seccion Resources existe
    if (-not ($validationTest.PSObject.Properties.Name -contains 'Resources')) {
        Write-WarningMessage "Advertencia: La plantilla limpia no contiene una seccion 'Resources'."
    }

    Write-Host ""
    Write-SuccessMessage "Plantilla limpia generada exitosamente: $outputPath"
    Write-Host ""
    Write-Host "Secciones eliminadas:"
    Write-Host "  - CDKMetadata (recurso)"
    Write-Host "  - Conditions (seccion completa)"
    Write-Host "  - Parameters (seccion completa)"
    Write-Host "  - Rules (seccion completa)"
    Write-Host ""
    Write-Host "Secciones preservadas:"
    Write-Host "  - Resources (con recursos de aplicacion)"
}
catch {
    $errorMsg = $_.Exception.Message
    Write-ErrorMessage "Error inesperado: $errorMsg"
}
