/**
 * Property 1: Bug Condition Exploration Test
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13**
 * 
 * This test explores the bug conditions in the Lab 1 README and scripts.
 * 
 * **CRITICAL**: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bugs exist. DO NOT fix the code when this test fails.
 * 
 * Bug Conditions Tested:
 * 1. SSO: ALL `aws` CLI commands should include `--profile <nombre-perfil>` by default
 * 2. PowerShell: For any Bash code block, a corresponding PowerShell block should exist
 * 3. PowerShell Scripts: Files `scripts/insert-test-data.ps1` and `scripts/verify-data.ps1` should exist
 * 4. CLI Syntax: `create-stack-refactor` should use `TemplateBody@=file://` (with `@=`)
 * 5. Directory: Commands with `file://` should have `pwd` verification preceding them
 * 6. Clarity: Sections "Información del Laboratorio", Logical ID explanation, Refactor Set explanation should exist
 */

import * as fs from 'fs';
import * as path from 'path';
import * as fc from 'fast-check';

describe('Property 1: Bug Condition Exploration - Multi-Environment Support', () => {
  const readmePath = path.join(__dirname, '..', 'README.md');
  const scriptsDir = path.join(__dirname, '..', 'scripts');
  let readmeContent: string;

  beforeAll(() => {
    readmeContent = fs.readFileSync(readmePath, 'utf-8');
  });

  describe('SSO Authentication - Bug Condition 1.1, 1.2, 1.3', () => {
    it('should include --profile in ALL aws CLI commands by default (SSO is primary auth method)', () => {
      // Extract all aws CLI commands from the README
      const awsCommandPattern = /```(?:bash|sh)?\s*\n([^`]*?aws\s+[^`]+?)\n```/gs;
      const matches = [...readmeContent.matchAll(awsCommandPattern)];
      
      const awsCommands: string[] = [];
      matches.forEach(match => {
        const codeBlock = match[1];
        // Split by newlines and filter for lines containing 'aws '
        const lines = codeBlock.split('\n');
        lines.forEach(line => {
          if (line.trim().startsWith('aws ') || line.includes(' aws ')) {
            awsCommands.push(line.trim());
          }
        });
      });

      expect(awsCommands.length).toBeGreaterThan(0);

      // Filter out commands that don't require authentication
      const commandsRequiringAuth = awsCommands.filter(cmd => 
        !cmd.includes('--version') && 
        !cmd.includes('aws help')
      );

      // Count commands with and without --profile
      const commandsWithProfile = commandsRequiringAuth.filter(cmd => 
        cmd.includes('--profile') || cmd.includes('profile')
      );
      const commandsWithoutProfile = commandsRequiringAuth.filter(cmd => 
        !cmd.includes('--profile') && !cmd.includes('profile')
      );

      // Document counterexamples
      const counterexamples = {
        totalAwsCommands: awsCommands.length,
        commandsRequiringAuth: commandsRequiringAuth.length,
        commandsWithProfile: commandsWithProfile.length,
        commandsWithoutProfile: commandsWithoutProfile.length,
        examplesWithoutProfile: commandsWithoutProfile.slice(0, 5),
      };

      console.log('\n=== SSO Bug Condition Counterexamples ===');
      console.log(JSON.stringify(counterexamples, null, 2));

      // EXPECTED TO FAIL: Most commands should NOT have --profile in unfixed code
      // After fix: ALL commands that require auth should have --profile by default
      expect(commandsWithProfile.length).toBe(commandsRequiringAuth.length);
    });

    it('should present AWS SSO as primary authentication method in Prerequisites', () => {
      // Match from ## Prerrequisitos to the next ## that's not a subsection (###)
      // Use a more specific pattern to capture the entire Prerequisites section
      const prerequisitesPattern = /## Prerrequisitos[\s\S]*?(?=\n## (?!#))/i;
      const prerequisitesMatch = readmeContent.match(prerequisitesPattern);
      
      expect(prerequisitesMatch).toBeTruthy();
      
      const prerequisitesSection = prerequisitesMatch![0];
      
      // Check for SSO-related content
      const hasSSOLogin = prerequisitesSection.includes('aws sso login');
      const hasSSOExplanation = prerequisitesSection.toLowerCase().includes('sso');
      const hasProfileExplanation = prerequisitesSection.includes('--profile');

      const counterexample = {
        hasSSOLogin,
        hasSSOExplanation,
        hasProfileExplanation,
        prerequisitesSectionLength: prerequisitesSection.length,
      };

      console.log('\n=== SSO Prerequisites Counterexample ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: Prerequisites should mention SSO as primary method
      expect(hasSSOLogin).toBe(true);
      expect(hasProfileExplanation).toBe(true);
    });
  });

  describe('PowerShell Support - Bug Conditions 1.4, 1.5, 1.6, 1.7', () => {
    it('should have PowerShell code blocks for each Bash code block', () => {
      // Find all bash code blocks
      const bashBlockPattern = /```(?:bash|sh)\s*\n[\s\S]*?\n```/g;
      const bashBlocks = [...readmeContent.matchAll(bashBlockPattern)];

      // Find all PowerShell code blocks
      const powershellBlockPattern = /```(?:powershell|ps1)\s*\n[\s\S]*?\n```/gi;
      const powershellBlocks = [...readmeContent.matchAll(powershellBlockPattern)];

      const counterexample = {
        bashBlockCount: bashBlocks.length,
        powershellBlockCount: powershellBlocks.length,
        hasPowerShellAlternatives: powershellBlocks.length > 0,
      };

      console.log('\n=== PowerShell Blocks Counterexample ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: Should have PowerShell blocks for Bash commands
      expect(powershellBlocks.length).toBeGreaterThan(0);
      // After fix, should have at least 6 PowerShell blocks (covering key steps)
      expect(powershellBlocks.length).toBeGreaterThanOrEqual(6);
    });

    it('should have date command alternatives for PowerShell', () => {
      // Check if README contains the problematic `date -u` command
      const hasDateCommand = readmeContent.includes('date -u');
      
      // Check if README contains PowerShell Get-Date alternative
      const hasGetDate = readmeContent.includes('Get-Date');

      const counterexample = {
        hasDateCommand,
        hasGetDate,
        hasPowerShellDateAlternative: hasGetDate,
      };

      console.log('\n=== PowerShell Date Command Counterexample ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: Should have Get-Date alternative for date -u
      if (hasDateCommand) {
        expect(hasGetDate).toBe(true);
      }
    });
  });

  describe('PowerShell Scripts - Bug Condition 1.5', () => {
    it('should have PowerShell script equivalents (.ps1 files)', () => {
      const insertTestDataPs1 = path.join(scriptsDir, 'insert-test-data.ps1');
      const verifyDataPs1 = path.join(scriptsDir, 'verify-data.ps1');

      const insertTestDataExists = fs.existsSync(insertTestDataPs1);
      const verifyDataExists = fs.existsSync(verifyDataPs1);

      const counterexample = {
        insertTestDataPs1Exists: insertTestDataExists,
        verifyDataPs1Exists: verifyDataExists,
        scriptsChecked: [insertTestDataPs1, verifyDataPs1],
      };

      console.log('\n=== PowerShell Scripts Counterexample ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: PowerShell scripts should exist
      expect(insertTestDataExists).toBe(true);
      expect(verifyDataExists).toBe(true);
    });
  });

  describe('CLI Syntax - Bug Condition 1.8', () => {
    it('should use TemplateBody@=file:// syntax (with @= operator) in create-stack-refactor', () => {
      // Find the create-stack-refactor command
      const createStackRefactorPattern = /aws\s+cloudformation\s+create-stack-refactor[\s\S]*?(?=```|$)/gi;
      const matches = [...readmeContent.matchAll(createStackRefactorPattern)];

      expect(matches.length).toBeGreaterThan(0);

      const commandText = matches[0][0];
      
      // Check for correct syntax with @=
      const hasCorrectSyntax = commandText.includes('TemplateBody@=file://');
      const hasIncorrectSyntax = commandText.includes('TemplateBody=file://') && 
                                  !commandText.includes('TemplateBody@=file://');

      const counterexample = {
        foundCreateStackRefactor: matches.length > 0,
        hasCorrectSyntax,
        hasIncorrectSyntax,
        commandSnippet: commandText.substring(0, 200),
      };

      console.log('\n=== CLI Syntax Counterexample ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: Should use TemplateBody@=file:// (with @=)
      expect(hasCorrectSyntax).toBe(true);
      expect(hasIncorrectSyntax).toBe(false);
    });
  });

  describe('Directory Verification - Bug Condition 1.10', () => {
    it('should have pwd verification before commands with file://', () => {
      // Find all commands with file://
      const fileProtocolPattern = /```(?:bash|sh)?\s*\n([^`]*?file:\/\/[^`]+?)\n```/gs;
      const matches = [...readmeContent.matchAll(fileProtocolPattern)];

      const commandsWithFile = matches.length;
      
      // Count how many have pwd verification nearby
      let commandsWithPwdVerification = 0;
      matches.forEach(match => {
        const index = match.index || 0;
        // Look 500 characters before the command for pwd verification
        const contextBefore = readmeContent.substring(Math.max(0, index - 500), index);
        if (contextBefore.includes('pwd') || contextBefore.includes('directorio')) {
          commandsWithPwdVerification++;
        }
      });

      const counterexample = {
        commandsWithFileProtocol: commandsWithFile,
        commandsWithPwdVerification,
        percentageWithVerification: commandsWithFile > 0 
          ? (commandsWithPwdVerification / commandsWithFile * 100).toFixed(1) + '%'
          : '0%',
      };

      console.log('\n=== Directory Verification Counterexample ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: Should have pwd verification for most file:// commands
      expect(commandsWithPwdVerification).toBeGreaterThanOrEqual(commandsWithFile * 0.8);
    });
  });

  describe('Clarity - Bug Conditions 1.17, 1.19, 1.20, 1.24', () => {
    it('should have "Información del Laboratorio" section', () => {
      const hasInfoSection = readmeContent.includes('Información del Laboratorio') ||
                             readmeContent.includes('## Información del Laboratorio');

      const counterexample = {
        hasInfoSection,
        readmeHasTitle: readmeContent.includes('# 🔄 Laboratorio 1'),
      };

      console.log('\n=== Lab Information Section Counterexample ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: Should have lab information section
      expect(hasInfoSection).toBe(true);
    });

    it('should have Logical ID explanation before Paso 6', () => {
      // Find the section before Paso 6 that should contain the Logical ID explanation
      // The explanation should be in a "Concepto" section or within the content before Paso 6
      const beforePaso6Pattern = /### Concepto:[\s\S]*?### Paso 6:/i;
      const beforePaso6Match = readmeContent.match(beforePaso6Pattern);

      expect(beforePaso6Match).toBeTruthy();

      const beforePaso6Section = beforePaso6Match![0];
      
      // Check if there's an explanation of what a Logical ID is
      const hasLogicalIdExplanation = beforePaso6Section.toLowerCase().includes('logical id') &&
                                       (beforePaso6Section.includes('qué es') || 
                                        beforePaso6Section.includes('identificador') ||
                                        beforePaso6Section.includes('definición'));

      const counterexample = {
        foundConceptoSection: true,
        hasLogicalIdExplanation,
        sectionLength: beforePaso6Section.length,
      };

      console.log('\n=== Logical ID Explanation Counterexample ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: Should explain what a Logical ID is
      expect(hasLogicalIdExplanation).toBe(true);
    });

    it('should have Refactor Set explanation before Paso 8', () => {
      // Find Paso 8 section
      const paso8Pattern = /### Paso 8:[\s\S]*?(?=###|$)/i;
      const paso8Match = readmeContent.match(paso8Pattern);

      expect(paso8Match).toBeTruthy();

      const paso8Section = paso8Match![0];
      
      // Check if there's an explanation of what a Refactor Set is
      const hasRefactorSetExplanation = paso8Section.toLowerCase().includes('refactor set') &&
                                         (paso8Section.includes('qué es') || 
                                          paso8Section.includes('artefacto') ||
                                          paso8Section.includes('orquesta'));

      const counterexample = {
        foundPaso8: true,
        hasRefactorSetExplanation,
        paso8Length: paso8Section.length,
      };

      console.log('\n=== Refactor Set Explanation Counterexample ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: Should explain what a Refactor Set is
      // Note: The current README does have "El Refactor Set es el artefacto que orquesta..."
      // This might actually pass, which would be good!
      expect(hasRefactorSetExplanation).toBe(true);
    });
  });

  describe('Property-Based Test: Bug Condition for Random Participant Names', () => {
    it('should verify SSO profile requirement holds for any participant name', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z]{3,10}$/), // Generate participant names
          (participantName) => {
            // For any participant name, verify that commands would need --profile
            const sampleCommand = `aws cloudformation describe-stacks --stack-name AmberMonolithStack-${participantName}`;
            
            // Check if this pattern exists in README without --profile
            const hasCommandPattern = readmeContent.includes('aws cloudformation describe-stacks');
            const hasProfileInCommands = readmeContent.match(/aws cloudformation describe-stacks[^\n]*--profile/);

            // Document the finding
            if (hasCommandPattern && !hasProfileInCommands) {
              console.log(`\nCounterexample for participant "${participantName}": describe-stacks command exists without --profile`);
            }

            // EXPECTED TO FAIL: Commands should include --profile
            return !hasCommandPattern || hasProfileInCommands !== null;
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
