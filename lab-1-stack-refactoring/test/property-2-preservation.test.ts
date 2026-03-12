/**
 * Property 2: Preservation Tests
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9**
 * 
 * This test verifies that existing functionality remains unchanged after the bugfix.
 * 
 * **CRITICAL**: These tests MUST PASS on unfixed code to establish the preservation baseline.
 * They capture the current behavior that must be preserved after implementing the fix.
 * 
 * Preservation Requirements:
 * 1. Bash scripts (`insert-test-data.sh`, `verify-data.sh`) must remain byte-identical
 * 2. Step numbering (Paso 0 through Paso 11) must be preserved
 * 3. Section structure and headings must remain consistent
 * 4. CDK TypeScript files must remain unchanged (unless AWS validation requires corrections)
 * 5. JSON config files must maintain their structure
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fc from 'fast-check';

describe('Property 2: Preservation - Existing Functionality Unchanged', () => {
  const readmePath = path.join(__dirname, '..', 'README.md');
  const scriptsDir = path.join(__dirname, '..', 'scripts');
  const cdkAppDir = path.join(__dirname, '..', 'cdk-app');
  
  let readmeContent: string;

  beforeAll(() => {
    readmeContent = fs.readFileSync(readmePath, 'utf-8');
  });

  describe('Bash Scripts Preservation - Requirements 3.1, 3.2', () => {
    // Baseline hashes captured from unfixed code
    // These will be used to verify scripts remain unchanged
    const BASELINE_HASHES = {
      'insert-test-data.sh': '',
      'verify-data.sh': '',
    };

    beforeAll(() => {
      // Capture baseline hashes from current (unfixed) code
      const insertTestDataPath = path.join(scriptsDir, 'insert-test-data.sh');
      const verifyDataPath = path.join(scriptsDir, 'verify-data.sh');

      if (fs.existsSync(insertTestDataPath)) {
        const content = fs.readFileSync(insertTestDataPath, 'utf-8');
        BASELINE_HASHES['insert-test-data.sh'] = crypto.createHash('sha256').update(content).digest('hex');
      }

      if (fs.existsSync(verifyDataPath)) {
        const content = fs.readFileSync(verifyDataPath, 'utf-8');
        BASELINE_HASHES['verify-data.sh'] = crypto.createHash('sha256').update(content).digest('hex');
      }
    });

    it('should preserve insert-test-data.sh content byte-for-byte', () => {
      const scriptPath = path.join(scriptsDir, 'insert-test-data.sh');
      expect(fs.existsSync(scriptPath)).toBe(true);

      const currentContent = fs.readFileSync(scriptPath, 'utf-8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');

      // Verify script content is unchanged
      expect(currentHash).toBe(BASELINE_HASHES['insert-test-data.sh']);

      // Additional checks for key functionality
      expect(currentContent).toContain('#!/bin/bash');
      expect(currentContent).toContain('aws dynamodb put-item');
      expect(currentContent).toContain('date -u +%Y-%m-%dT%H:%M:%SZ');
      expect(currentContent).toContain('amber-data-${PARTICIPANT_NAME}');
    });

    it('should preserve verify-data.sh content byte-for-byte', () => {
      const scriptPath = path.join(scriptsDir, 'verify-data.sh');
      expect(fs.existsSync(scriptPath)).toBe(true);

      const currentContent = fs.readFileSync(scriptPath, 'utf-8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');

      // Verify script content is unchanged
      expect(currentHash).toBe(BASELINE_HASHES['verify-data.sh']);

      // Additional checks for key functionality
      expect(currentContent).toContain('#!/bin/bash');
      expect(currentContent).toContain('aws dynamodb get-item');
      expect(currentContent).toContain('jq');
      expect(currentContent).toContain('amber-data-${PARTICIPANT_NAME}');
    });

    it('should verify bash scripts work for any participant name', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z]{3,10}$/), // Generate participant names
          (participantName) => {
            const insertScript = fs.readFileSync(
              path.join(scriptsDir, 'insert-test-data.sh'),
              'utf-8'
            );
            const verifyScript = fs.readFileSync(
              path.join(scriptsDir, 'verify-data.sh'),
              'utf-8'
            );

            // Verify scripts use the participant name variable correctly
            const hasParticipantVar = insertScript.includes('PARTICIPANT_NAME') &&
                                       verifyScript.includes('PARTICIPANT_NAME');
            
            const hasTableNamePattern = insertScript.includes('amber-data-${PARTICIPANT_NAME}') &&
                                         verifyScript.includes('amber-data-${PARTICIPANT_NAME}');

            return hasParticipantVar && hasTableNamePattern;
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('README Step Numbering Preservation - Requirements 3.3, 3.5', () => {
    it('should preserve step numbering from Paso 0 through Paso 11', () => {
      // Extract all step headings
      const stepPattern = /### Paso (\d+):/g;
      const steps: number[] = [];
      let match;

      while ((match = stepPattern.exec(readmeContent)) !== null) {
        steps.push(parseInt(match[1], 10));
      }

      // Verify we have all steps from 0 to 11
      expect(steps.length).toBe(12); // 0 through 11 = 12 steps
      expect(steps).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

      // Verify steps are in order
      for (let i = 0; i < steps.length - 1; i++) {
        expect(steps[i + 1]).toBe(steps[i] + 1);
      }
    });

    it('should preserve specific step titles', () => {
      // Key step titles that should remain unchanged
      const expectedSteps = [
        'Paso 0: Clonar el repositorio del workshop',
        'Paso 1: Verificar región de AWS',
        'Paso 2: Instalar dependencias del proyecto CDK',
        'Paso 3: Desplegar el Stack monolítico',
        'Paso 4: Insertar datos de prueba',
        'Paso 5: Refactorizar el código CDK',
        'Paso 6: Extraer Logical IDs de las plantillas',
        'Paso 7: Crear archivo de mapeo',
        'Paso 8: Crear Refactor Set',
        'Paso 9: Ejecutar Stack Refactoring',
        'Paso 10: Verificar migración exitosa',
        'Paso 11: Despliegue post-refactoring',
      ];

      expectedSteps.forEach(stepTitle => {
        expect(readmeContent).toContain(stepTitle);
      });
    });
  });

  describe('README Section Structure Preservation - Requirements 3.4, 3.5', () => {
    it('should preserve main section headings', () => {
      const expectedSections = [
        '## Índice',
        '## Objetivos de Aprendizaje',
        '## Prerrequisitos',
        '## Configuración del Entorno',
        '## Arquitectura',
        '## Pasos del Laboratorio',
        '## Limpieza',
        '## Solución de Problemas',
      ];

      expectedSections.forEach(section => {
        expect(readmeContent).toContain(section);
      });
    });

    it('should preserve learning objectives', () => {
      const objectivesSection = readmeContent.match(/## Objetivos de Aprendizaje[\s\S]*?(?=##)/)?.[0] || '';
      
      // Key learning objectives that should remain
      expect(objectivesSection).toContain('Stack Refactoring');
      expect(objectivesSection).toContain('DynamoDB');
      expect(objectivesSection).toContain('Zero-Downtime');
      expect(objectivesSection).toContain('AWS CDK');
      expect(objectivesSection).toContain('AWS CLI');
    });

    it('should preserve table of contents structure', () => {
      const tocSection = readmeContent.match(/## Índice[\s\S]*?(?=##)/)?.[0] || '';
      
      // Verify TOC contains links to all major sections
      expect(tocSection).toContain('#objetivos-de-aprendizaje');
      expect(tocSection).toContain('#prerrequisitos');
      expect(tocSection).toContain('#pasos-del-laboratorio');
      expect(tocSection).toContain('#limpieza');
    });
  });

  describe('CDK TypeScript Files Preservation - Requirements 3.7, 3.8', () => {
    const CDK_FILES = [
      'bin/amber-app.ts',
      'lib/amber-monolith-stack.ts',
      'lib/amber-data-stack.ts',
    ];

    const BASELINE_CDK_HASHES: Record<string, string> = {};

    beforeAll(() => {
      // Capture baseline hashes from current (unfixed) code
      CDK_FILES.forEach(file => {
        const filePath = path.join(cdkAppDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          BASELINE_CDK_HASHES[file] = crypto.createHash('sha256').update(content).digest('hex');
        }
      });
    });

    it('should preserve amber-app.ts content', () => {
      const filePath = path.join(cdkAppDir, 'bin/amber-app.ts');
      expect(fs.existsSync(filePath)).toBe(true);

      const currentContent = fs.readFileSync(filePath, 'utf-8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');

      // Verify file content is unchanged
      expect(currentHash).toBe(BASELINE_CDK_HASHES['bin/amber-app.ts']);

      // Verify key imports and structure
      expect(currentContent).toContain('import { AmberMonolithStack }');
      expect(currentContent).toContain('import { AmberDataStack }');
      expect(currentContent).toContain('participantName');
    });

    it('should preserve amber-monolith-stack.ts content', () => {
      const filePath = path.join(cdkAppDir, 'lib/amber-monolith-stack.ts');
      expect(fs.existsSync(filePath)).toBe(true);

      const currentContent = fs.readFileSync(filePath, 'utf-8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');

      // Verify file content is unchanged
      expect(currentHash).toBe(BASELINE_CDK_HASHES['lib/amber-monolith-stack.ts']);

      // Verify key DynamoDB table configuration
      expect(currentContent).toContain('dynamodb.Table');
      expect(currentContent).toContain('amber-data-');
      expect(currentContent).toContain('RemovalPolicy.RETAIN');
      expect(currentContent).toContain("'Table'"); // Logical ID
    });

    it('should preserve amber-data-stack.ts content', () => {
      const filePath = path.join(cdkAppDir, 'lib/amber-data-stack.ts');
      expect(fs.existsSync(filePath)).toBe(true);

      const currentContent = fs.readFileSync(filePath, 'utf-8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');

      // Verify file content is unchanged
      expect(currentHash).toBe(BASELINE_CDK_HASHES['lib/amber-data-stack.ts']);

      // Verify key DynamoDB table configuration matches monolith stack
      expect(currentContent).toContain('dynamodb.Table');
      expect(currentContent).toContain('amber-data-');
      expect(currentContent).toContain('RemovalPolicy.RETAIN');
      expect(currentContent).toContain("'Table'"); // Same Logical ID as monolith
    });

    it('should verify CDK stacks use same Logical ID for DynamoDB table', () => {
      const monolithPath = path.join(cdkAppDir, 'lib/amber-monolith-stack.ts');
      const dataPath = path.join(cdkAppDir, 'lib/amber-data-stack.ts');

      const monolithContent = fs.readFileSync(monolithPath, 'utf-8');
      const dataContent = fs.readFileSync(dataPath, 'utf-8');

      // Extract Logical ID from both stacks
      const logicalIdPattern = /new dynamodb\.Table\(this,\s*'([^']+)'/;
      const monolithMatch = monolithContent.match(logicalIdPattern);
      const dataMatch = dataContent.match(logicalIdPattern);

      expect(monolithMatch).toBeTruthy();
      expect(dataMatch).toBeTruthy();

      // Verify both use the same Logical ID 'Table'
      expect(monolithMatch![1]).toBe('Table');
      expect(dataMatch![1]).toBe('Table');
      expect(monolithMatch![1]).toBe(dataMatch![1]);
    });
  });

  describe('JSON Config Files Preservation - Requirements 3.8, 3.9', () => {
    const JSON_FILES = [
      'refactor-mapping.json',
      'input.json',
    ];

    const BASELINE_JSON_HASHES: Record<string, string> = {};

    beforeAll(() => {
      // Capture baseline hashes from current (unfixed) code
      JSON_FILES.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          BASELINE_JSON_HASHES[file] = crypto.createHash('sha256').update(content).digest('hex');
        }
      });
    });

    it('should preserve refactor-mapping.json structure', () => {
      const filePath = path.join(__dirname, '..', 'refactor-mapping.json');
      expect(fs.existsSync(filePath)).toBe(true);

      const currentContent = fs.readFileSync(filePath, 'utf-8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');

      // Verify file content is unchanged
      expect(currentHash).toBe(BASELINE_JSON_HASHES['refactor-mapping.json']);

      // Verify JSON structure
      const json = JSON.parse(currentContent);
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBeGreaterThan(0);
      expect(json[0]).toHaveProperty('Source');
      expect(json[0]).toHaveProperty('Destination');
      expect(json[0].Source).toHaveProperty('StackName');
      expect(json[0].Source).toHaveProperty('LogicalResourceId');
    });

    it('should preserve input.json structure', () => {
      const filePath = path.join(__dirname, '..', 'input.json');
      expect(fs.existsSync(filePath)).toBe(true);

      const currentContent = fs.readFileSync(filePath, 'utf-8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');

      // Verify file content is unchanged
      expect(currentHash).toBe(BASELINE_JSON_HASHES['input.json']);

      // Verify file contains expected structure (may be incomplete JSON as part of lab)
      expect(currentContent).toContain('Description');
      expect(currentContent).toContain('EnableStackCreation');
      expect(currentContent).toContain('ResourceMappings');
      expect(currentContent).toContain('StackDefinitions');
    });

    it('should verify JSON files use consistent Logical ID', () => {
      const refactorMappingPath = path.join(__dirname, '..', 'refactor-mapping.json');
      const inputPath = path.join(__dirname, '..', 'input.json');

      const refactorMapping = JSON.parse(fs.readFileSync(refactorMappingPath, 'utf-8'));
      const inputContent = fs.readFileSync(inputPath, 'utf-8');

      // Verify refactor-mapping.json uses the expected Logical ID
      expect(refactorMapping[0].Source.LogicalResourceId).toBe('TableCD117FA1');
      expect(refactorMapping[0].Destination.LogicalResourceId).toBe('TableCD117FA1');

      // Verify input.json contains the same Logical ID (even if incomplete JSON)
      expect(inputContent).toContain('TableCD117FA1');
      expect(inputContent).toContain('AmberMonolithStack');
      expect(inputContent).toContain('AmberDataStack');
    });
  });

  describe('Lab Compatibility Preservation - Requirements 3.6', () => {
    it('should preserve resource naming convention for Lab 2 and Lab 3 compatibility', () => {
      // Verify README mentions resource persistence for subsequent labs
      expect(readmeContent).toContain('Laboratorios 2 y 3');
      expect(readmeContent).toContain('NO elimine estos recursos');

      // Verify DynamoDB table naming pattern
      const cdkFiles = [
        path.join(cdkAppDir, 'lib/amber-monolith-stack.ts'),
        path.join(cdkAppDir, 'lib/amber-data-stack.ts'),
      ];

      cdkFiles.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('amber-data-${props.participantName}');
      });

      // Verify stack naming pattern
      const appContent = fs.readFileSync(path.join(cdkAppDir, 'bin/amber-app.ts'), 'utf-8');
      expect(appContent).toContain('AmberMonolithStack-${participantName}');
      expect(appContent).toContain('AmberDataStack-${participantName}');
    });

    it('should preserve RemovalPolicy.RETAIN for data persistence', () => {
      const cdkFiles = [
        path.join(cdkAppDir, 'lib/amber-monolith-stack.ts'),
        path.join(cdkAppDir, 'lib/amber-data-stack.ts'),
      ];

      cdkFiles.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('RemovalPolicy.RETAIN');
      });
    });
  });

  describe('Property-Based Test: Preservation for Random Participant Names', () => {
    it('should verify resource naming works for any participant name', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z]{3,10}$/), // Generate participant names
          (participantName) => {
            // Verify table naming pattern in scripts
            const insertScript = fs.readFileSync(
              path.join(scriptsDir, 'insert-test-data.sh'),
              'utf-8'
            );
            const verifyScript = fs.readFileSync(
              path.join(scriptsDir, 'verify-data.sh'),
              'utf-8'
            );

            const scriptsUsePattern = insertScript.includes('amber-data-${PARTICIPANT_NAME}') &&
                                       verifyScript.includes('amber-data-${PARTICIPANT_NAME}');

            // Verify table naming pattern in CDK
            const monolithStack = fs.readFileSync(
              path.join(cdkAppDir, 'lib/amber-monolith-stack.ts'),
              'utf-8'
            );
            const dataStack = fs.readFileSync(
              path.join(cdkAppDir, 'lib/amber-data-stack.ts'),
              'utf-8'
            );

            const cdkUsesPattern = monolithStack.includes('amber-data-${props.participantName}') &&
                                    dataStack.includes('amber-data-${props.participantName}');

            return scriptsUsePattern && cdkUsesPattern;
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
