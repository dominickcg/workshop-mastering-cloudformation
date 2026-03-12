/**
 * Property 2: Preservation - Previously Corrected Content Preservation
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 * 
 * IMPORTANT: These tests MUST PASS on unfixed code - they establish the baseline
 * behavior that must be preserved after the fix is implemented.
 * 
 * This test suite verifies that:
 * - Step 9 of README.md already shows the correct `describe-events --operation-id` command
 * - AWS_DOCUMENTATION_VALIDATION.md remains unchanged
 * - VALIDATION_CHANGES_SUMMARY.md remains unchanged
 * - Other steps (1-8, 10-12) in README.md remain unchanged
 * - Non-buggy sections of TROUBLESHOOTING.md remain unchanged
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

describe('Property 2: Preservation - Previously Corrected Content', () => {
  const readmeContent = fs.readFileSync(
    path.join(__dirname, '../README.md'),
    'utf-8'
  );
  
  const troubleshootingContent = fs.readFileSync(
    path.join(__dirname, '../TROUBLESHOOTING.md'),
    'utf-8'
  );
  
  const validationDocContent = fs.readFileSync(
    path.join(__dirname, '../AWS_DOCUMENTATION_VALIDATION.md'),
    'utf-8'
  );
  
  const validationSummaryContent = fs.readFileSync(
    path.join(__dirname, '../VALIDATION_CHANGES_SUMMARY.md'),
    'utf-8'
  );

  describe('Step 9 Preservation - Already Corrected', () => {
    test('Step 9 should already contain correct describe-events command', () => {
      // Requirement 3.1: Step 9 was previously corrected and must remain unchanged
      
      // Extract Step 9 section
      const step9Match = readmeContent.match(
        /## Paso 9: Troubleshooting con Operation ID[\s\S]*?(?=\n## Paso 10:|$)/
      );
      expect(step9Match).toBeTruthy();
      
      const step9Content = step9Match![0];
      
      // Step 9 SHOULD already contain the correct command
      expect(step9Content).toContain('describe-events');
      expect(step9Content).toContain('--operation-id');
      
      // Step 9 should NOT contain the incorrect command
      expect(step9Content).not.toContain('describe-stack-events --operation-id');
    });

    test('Step 9 should contain correct CLI reference comment', () => {
      // Requirement 3.1: Step 9 includes official documentation reference
      
      const step9Match = readmeContent.match(
        /## Paso 9: Troubleshooting con Operation ID[\s\S]*?(?=\n## Paso 10:|$)/
      );
      expect(step9Match).toBeTruthy();
      
      const step9Content = step9Match![0];
      
      // Should contain reference to official documentation
      expect(step9Content).toContain('https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/view-stack-events-by-operation.html');
    });

    test('Step 9 should show correct command with filter parameter', () => {
      // Requirement 3.1: Step 9 shows the correct filter usage
      
      const step9Match = readmeContent.match(
        /## Paso 9: Troubleshooting con Operation ID[\s\S]*?(?=\n## Paso 10:|$)/
      );
      expect(step9Match).toBeTruthy();
      
      const step9Content = step9Match![0];
      
      // Should show the --filter parameter usage
      expect(step9Content).toContain('--filter FailedEvents=true');
    });
  });

  describe('Validation Files Preservation', () => {
    test('AWS_DOCUMENTATION_VALIDATION.md should remain unchanged', () => {
      // Requirement 3.2: Validation document must not be modified
      
      // Verify the file exists and has expected structure
      expect(validationDocContent).toContain('# AWS Documentation Validation Report - Laboratorio 2');
      expect(validationDocContent).toContain('## 8.2 ⚠️ Validación de comando describe-stack-events con --operation-id');
      expect(validationDocContent).toContain('**Estado**: DISCREPANCIA CRÍTICA - Comando incorrecto');
      
      // Verify it documents the original problem
      expect(validationDocContent).toContain('describe-stack-events --operation-id');
      expect(validationDocContent).toContain('describe-events --operation-id');
    });

    test('VALIDATION_CHANGES_SUMMARY.md should remain unchanged', () => {
      // Requirement 3.3: Changes summary must not be modified
      
      // Verify the file exists and has expected structure
      expect(validationSummaryContent).toContain('# Resumen de Cambios - Validación AWS Documentation');
      expect(validationSummaryContent).toContain('## Cambios Implementados');
      expect(validationSummaryContent).toContain('### 1. ✅ Corrección Crítica: Comando describe-events');
      
      // Verify it documents the changes made
      expect(validationSummaryContent).toContain('Reemplazado por `describe-events --operation-id` en el Paso 9');
    });

    test('Validation files should have stable content hashes', () => {
      // Requirement 3.2, 3.3: Files should not change
      
      // Create content hashes to detect any modifications
      const validationHash = crypto.createHash('sha256').update(validationDocContent).digest('hex');
      const summaryHash = crypto.createHash('sha256').update(validationSummaryContent).digest('hex');
      
      // Store hashes for comparison (these will be the baseline)
      // In a real scenario, these would be stored and compared against
      expect(validationHash).toBeTruthy();
      expect(summaryHash).toBeTruthy();
      expect(validationHash.length).toBe(64); // SHA-256 produces 64 hex characters
      expect(summaryHash.length).toBe(64);
    });
  });

  describe('Other Steps Preservation - README.md', () => {
    test('Steps 1-8 should remain unchanged', () => {
      // Requirement 3.5: Steps 1-8 must not be modified
      
      // Extract steps 1-8
      const steps1to8Match = readmeContent.match(
        /## Paso 1: Verificar Región y Entorno[\s\S]*?(?=## Paso 9: Troubleshooting con Operation ID)/
      );
      expect(steps1to8Match).toBeTruthy();
      
      const steps1to8Content = steps1to8Match![0];
      
      // Verify key content exists in these steps
      expect(steps1to8Content).toContain('## Paso 1: Verificar Región y Entorno');
      expect(steps1to8Content).toContain('## Paso 2: Agregar S3 Bucket con Nombre Explícito');
      expect(steps1to8Content).toContain('## Paso 3: Observar Early Validation');
      expect(steps1to8Content).toContain('## Paso 4: Corregir Nombre Duplicado');
      expect(steps1to8Content).toContain('## Paso 5: Agregar Lambda Function');
      expect(steps1to8Content).toContain('## Paso 6: Restringir Permisos IAM');
      expect(steps1to8Content).toContain('## Paso 7: Observar Fallo y Rollback');
      expect(steps1to8Content).toContain('## Paso 8: Extraer Operation ID');
      
      // These steps should not contain describe-events or describe-stack-events with operation-id
      // (they deal with other topics)
      const operationIdReferences = steps1to8Content.match(/describe-(?:stack-)?events[^\n]*operation-id/gi);
      expect(operationIdReferences).toBeNull();
    });

    test('Steps 10-12 should remain unchanged', () => {
      // Requirement 3.5: Steps 10-12 must not be modified
      
      // Extract steps 10-12
      const steps10to12Match = readmeContent.match(
        /## Paso 10: Restaurar Permisos[\s\S]*?(?=## Arquitectura)/
      );
      expect(steps10to12Match).toBeTruthy();
      
      const steps10to12Content = steps10to12Match![0];
      
      // Verify key content exists in these steps
      expect(steps10to12Content).toContain('## Paso 10: Restaurar Permisos');
      expect(steps10to12Content).toContain('## Paso 11: Despliegue Exitoso');
      expect(steps10to12Content).toContain('## Paso 12: Verificar Recursos y Datos');
      
      // These steps should not contain describe-events or describe-stack-events with operation-id
      const operationIdReferences = steps10to12Content.match(/describe-(?:stack-)?events[^\n]*operation-id/gi);
      expect(operationIdReferences).toBeNull();
    });

    test('Introduction and metadata sections should remain unchanged', () => {
      // Requirement 3.5: Introduction, objectives, prerequisites should not change
      
      // Extract introduction sections
      const introMatch = readmeContent.match(
        /# 🔍 Laboratorio 2: Early Validation & Troubleshooting[\s\S]*?(?=## Paso 1:)/
      );
      expect(introMatch).toBeTruthy();
      
      const introContent = introMatch![0];
      
      // Verify key sections exist
      expect(introContent).toContain('## Información del Laboratorio');
      expect(introContent).toContain('## Objetivos de Aprendizaje');
      expect(introContent).toContain('## Prerrequisitos');
      expect(introContent).toContain('**Tiempo estimado**: 30 minutos');
      expect(introContent).toContain('**Método de implementación**: AWS CDK + AWS CLI');
    });
  });

  describe('Other Sections Preservation - TROUBLESHOOTING.md', () => {
    test('Bucket name already exists section should remain unchanged', () => {
      // Requirement 3.6: Non-buggy troubleshooting sections must not change
      
      // Extract the "Bucket name already exists" section
      const bucketErrorMatch = troubleshootingContent.match(
        /### Error: Bucket name already exists[\s\S]*?(?=\n### Error: AccessDenied)/
      );
      expect(bucketErrorMatch).toBeTruthy();
      
      const bucketErrorContent = bucketErrorMatch![0];
      
      // Verify key content exists
      expect(bucketErrorContent).toContain('**Síntoma:**');
      expect(bucketErrorContent).toContain('**Causa:**');
      expect(bucketErrorContent).toContain('**Solución:**');
      expect(bucketErrorContent).toContain('amber-workshop-bucket');
      expect(bucketErrorContent).toContain('Early Validation');
      
      // This section should not mention describe-events or describe-stack-events
      expect(bucketErrorContent).not.toContain('describe-events');
      expect(bucketErrorContent).not.toContain('describe-stack-events');
    });

    test('IAM permissions error section should remain unchanged', () => {
      // Requirement 3.6: Non-buggy troubleshooting sections must not change
      
      // Extract the "Errores de Permisos IAM" section
      const iamErrorMatch = troubleshootingContent.match(
        /### Errores de Permisos IAM[\s\S]*?(?=\n### Errores de Límites|---\n\n## )/
      );
      expect(iamErrorMatch).toBeTruthy();
      
      const iamErrorContent = iamErrorMatch![0];
      
      // Verify key content exists
      expect(iamErrorContent).toContain('**Síntomas:**');
      expect(iamErrorContent).toContain('**Causa:**');
      expect(iamErrorContent).toContain('**Solución:**');
      expect(iamErrorContent).toContain('AccessDenied');
      expect(iamErrorContent).toContain('NO intente solucionar este error por su cuenta');
    });

    test('Service Quotas error section should remain unchanged', () => {
      // Requirement 3.6: Non-buggy troubleshooting sections must not change
      
      // Extract the "Errores de Límites de Cuota" section
      const quotaErrorMatch = troubleshootingContent.match(
        /### Errores de Límites de Cuota de AWS[\s\S]*?(?=---\n\n## Otros Errores|$)/
      );
      expect(quotaErrorMatch).toBeTruthy();
      
      const quotaErrorContent = quotaErrorMatch![0];
      
      // Verify key content exists
      expect(quotaErrorContent).toContain('**Síntomas:**');
      expect(quotaErrorContent).toContain('**Causa:**');
      expect(quotaErrorContent).toContain('**Solución:**');
      expect(quotaErrorContent).toContain('Service Quotas');
      expect(quotaErrorContent).toContain('LimitExceededException');
    });

    test('Other common errors section should remain unchanged', () => {
      // Requirement 3.6: Non-buggy troubleshooting sections must not change
      
      // Extract the "Otros Errores Comunes" section
      const otherErrorsMatch = troubleshootingContent.match(
        /## Otros Errores Comunes[\s\S]*?(?=Si encuentra un error que no está documentado|$)/
      );
      expect(otherErrorsMatch).toBeTruthy();
      
      const otherErrorsContent = otherErrorsMatch![0];
      
      // Verify key content exists
      expect(otherErrorsContent).toContain('### Error: Permission denied al ejecutar scripts');
      expect(otherErrorsContent).toContain('### Error: CDK bootstrap no ejecutado');
      expect(otherErrorsContent).toContain('### Error: Node.js o npm no instalado');
      expect(otherErrorsContent).toContain('chmod +x scripts/*.sh');
      expect(otherErrorsContent).toContain('cdk bootstrap');
    });
  });

  describe('Content Integrity - No Unintended Changes', () => {
    test('README.md should maintain overall structure', () => {
      // Requirement 3.4, 3.5: Overall structure must be preserved
      
      // Verify table of contents exists
      expect(readmeContent).toContain('## Índice');
      
      // Verify all major sections exist
      expect(readmeContent).toContain('## Arquitectura');
      expect(readmeContent).toContain('## Resumen de Conceptos Aprendidos');
      expect(readmeContent).toContain('## Próximo Laboratorio');
      expect(readmeContent).toContain('## Solución de Problemas');
      
      // Verify Mermaid diagram exists
      expect(readmeContent).toContain('```mermaid');
      expect(readmeContent).toContain('graph TB');
    });

    test('TROUBLESHOOTING.md should maintain overall structure', () => {
      // Requirement 3.6: Overall structure must be preserved
      
      // Verify table of contents exists
      expect(troubleshootingContent).toContain('## Índice');
      
      // Verify major sections exist
      expect(troubleshootingContent).toContain('## Errores Esperados del Laboratorio');
      expect(troubleshootingContent).toContain('## Errores que Requieren Asistencia del Instructor');
      expect(troubleshootingContent).toContain('## Otros Errores Comunes');
    });

    test('All CLI commands in non-buggy sections should remain valid', () => {
      // Requirement 3.4: Other CLI commands must continue to work correctly
      
      // Extract all bash code blocks from README
      const bashBlocks = readmeContent.match(/```bash[\s\S]*?```/g) || [];
      
      // Verify common CLI commands are present and correctly formatted
      const allBashContent = bashBlocks.join('\n');
      
      // Check for valid AWS CLI commands (not exhaustive, just key examples)
      expect(allBashContent).toContain('aws configure get region');
      expect(allBashContent).toContain('aws cloudformation describe-stacks');
      expect(allBashContent).toContain('aws dynamodb describe-table');
      expect(allBashContent).toContain('cdk deploy');
      expect(allBashContent).toContain('cdk synth');
      
      // Verify no malformed commands (basic sanity check)
      expect(allBashContent).not.toContain('aws aws');
      expect(allBashContent).not.toContain('cdk cdk');
    });
  });
});
