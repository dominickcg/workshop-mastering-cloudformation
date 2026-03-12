/**
 * Property 1: Bug Condition Exploration Test - CDK Template Compatibility
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 * 
 * This test explores the bug condition where CDK-generated templates with problematic
 * sections (CDKMetadata, Conditions, Parameters, Rules) cause the "Modify" error
 * during Stack Refactoring operations.
 * 
 * **CRITICAL**: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists. DO NOT fix the code when this test fails.
 * 
 * Bug Condition Tested:
 * CDK templates containing CDKMetadata, Conditions, Parameters, or Rules sections
 * cause `create-stack-refactor` to fail with "Modify" error because CloudFormation
 * Stack Refactoring interprets these sections as modifications not permitted during
 * refactoring operations.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as fc from 'fast-check';

describe('Property 1: Bug Condition Exploration - CDK Template Compatibility', () => {
  const cdkOutDir = path.join(__dirname, '..', 'cdk-app', 'cdk.out');

  describe('CDK Template Structure Analysis', () => {
    it('should detect problematic sections in CDK-generated templates', () => {
      // Find all CDK-generated template files (not clean versions)
      const templateFiles = fs.readdirSync(cdkOutDir)
        .filter(file => file.endsWith('.template.json') && !file.includes('-clean'))
        .map(file => path.join(cdkOutDir, file));

      expect(templateFiles.length).toBeGreaterThan(0);

      const counterexamples: any[] = [];

      templateFiles.forEach(templatePath => {
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const template = JSON.parse(templateContent);

        const hasCDKMetadata = template.Resources && 
          Object.values(template.Resources).some((resource: any) => 
            resource.Type === 'AWS::CDK::Metadata'
          );
        
        const hasConditions = template.Conditions !== undefined;
        const hasParameters = template.Parameters !== undefined;
        const hasRules = template.Rules !== undefined;

        const problematicSections = {
          templateFile: path.basename(templatePath),
          hasCDKMetadata,
          hasConditions,
          hasParameters,
          hasRules,
          conditionNames: hasConditions ? Object.keys(template.Conditions) : [],
          parameterNames: hasParameters ? Object.keys(template.Parameters) : [],
          ruleNames: hasRules ? Object.keys(template.Rules) : [],
        };

        counterexamples.push(problematicSections);

        console.log('\n=== CDK Template Analysis ===');
        console.log(JSON.stringify(problematicSections, null, 2));
      });

      // EXPECTED TO FAIL: CDK templates should NOT have these sections for Stack Refactoring
      // After fix: Templates used for Stack Refactoring should be cleaned
      counterexamples.forEach(example => {
        expect(example.hasCDKMetadata || example.hasConditions || 
               example.hasParameters || example.hasRules).toBe(false);
      });
    });

    it('should verify clean templates only contain Resources section', () => {
      // Find clean template files
      const cleanTemplateFiles = fs.readdirSync(cdkOutDir)
        .filter(file => file.includes('-clean.template.json'))
        .map(file => path.join(cdkOutDir, file));

      // If no clean templates exist, this confirms the bug (no fix applied yet)
      if (cleanTemplateFiles.length === 0) {
        console.log('\n=== No Clean Templates Found ===');
        console.log('This confirms the bug: no cleaned templates exist for Stack Refactoring');
        
        // EXPECTED TO FAIL: Clean templates should exist after fix
        expect(cleanTemplateFiles.length).toBeGreaterThan(0);
        return;
      }

      const cleanTemplateAnalysis: any[] = [];

      cleanTemplateFiles.forEach(templatePath => {
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const template = JSON.parse(templateContent);

        const topLevelSections = Object.keys(template);
        const hasOnlyResources = topLevelSections.length === 1 && 
                                  topLevelSections[0] === 'Resources';

        const analysis = {
          templateFile: path.basename(templatePath),
          topLevelSections,
          hasOnlyResources,
          resourceCount: template.Resources ? Object.keys(template.Resources).length : 0,
        };

        cleanTemplateAnalysis.push(analysis);

        console.log('\n=== Clean Template Analysis ===');
        console.log(JSON.stringify(analysis, null, 2));
      });

      // Clean templates should only have Resources section
      cleanTemplateAnalysis.forEach(analysis => {
        expect(analysis.hasOnlyResources).toBe(true);
      });
    });
  });

  describe('Property-Based Test: CDK Template Sections Cause Errors', () => {
    // Generator for problematic template sections
    const problematicSectionArbitrary = fc.record({
      hasCDKMetadata: fc.boolean(),
      hasConditions: fc.boolean(),
      hasParameters: fc.boolean(),
      hasRules: fc.boolean(),
    }).filter(sections => 
      // At least one problematic section must be present
      sections.hasCDKMetadata || sections.hasConditions || 
      sections.hasParameters || sections.hasRules
    );

    it('should fail create-stack-refactor for any template with problematic sections', () => {
      fc.assert(
        fc.property(
          problematicSectionArbitrary,
          (sections) => {
            // Create a mock template with the specified problematic sections
            const mockTemplate: any = {
              Resources: {
                TableCD117FA1: {
                  Type: 'AWS::DynamoDB::Table',
                  Properties: {
                    TableName: 'test-table',
                  },
                },
              },
            };

            if (sections.hasCDKMetadata) {
              mockTemplate.Resources.CDKMetadata = {
                Type: 'AWS::CDK::Metadata',
                Properties: {
                  Analytics: 'v2:deflate64:test',
                },
              };
            }

            if (sections.hasConditions) {
              mockTemplate.Conditions = {
                CDKMetadataAvailable: {
                  'Fn::Equals': [{ Ref: 'AWS::Region' }, 'us-east-1'],
                },
              };
            }

            if (sections.hasParameters) {
              mockTemplate.Parameters = {
                BootstrapVersion: {
                  Type: 'AWS::SSM::Parameter::Value<String>',
                  Default: '/cdk-bootstrap/hnb659fds/version',
                },
              };
            }

            if (sections.hasRules) {
              mockTemplate.Rules = {
                CheckBootstrapVersion: {
                  Assertions: [{
                    Assert: { 'Fn::Not': [true] },
                    AssertDescription: 'CDK bootstrap stack version 6 required.',
                  }],
                },
              };
            }

            // Log the counterexample
            console.log('\n=== Property-Based Counterexample ===');
            console.log('Template with sections:', JSON.stringify(sections, null, 2));

            // EXPECTED TO FAIL: Templates with these sections should NOT be used for Stack Refactoring
            // The bug condition is that these sections cause "Modify" errors
            // After fix: Only clean templates (without these sections) should be used
            
            // This assertion represents the bug condition:
            // If ANY problematic section exists, the template is NOT suitable for Stack Refactoring
            const isSuitableForStackRefactoring = 
              !sections.hasCDKMetadata && 
              !sections.hasConditions && 
              !sections.hasParameters && 
              !sections.hasRules;

            return isSuitableForStackRefactoring;
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('README Instructions Verification', () => {
    const readmePath = path.join(__dirname, '..', 'README.md');
    let readmeContent: string;

    beforeAll(() => {
      readmeContent = fs.readFileSync(readmePath, 'utf-8');
    });

    it('should reference clean templates in create-stack-refactor command', () => {
      // Find the create-stack-refactor command in README
      const createStackRefactorPattern = /aws\s+cloudformation\s+create-stack-refactor[\s\S]*?(?=```|$)/gi;
      const matches = [...readmeContent.matchAll(createStackRefactorPattern)];

      expect(matches.length).toBeGreaterThan(0);

      const commandText = matches[0][0];
      
      // Check if command references clean templates
      const usesCleanTemplates = commandText.includes('-clean.template.json');
      const usesCDKTemplates = commandText.includes('cdk.out/') && 
                                !commandText.includes('-clean');

      const counterexample = {
        foundCreateStackRefactor: matches.length > 0,
        usesCleanTemplates,
        usesCDKTemplates,
        commandSnippet: commandText.substring(0, 300),
      };

      console.log('\n=== README Command Analysis ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: Should use clean templates, not CDK-generated templates
      expect(usesCleanTemplates).toBe(true);
      expect(usesCDKTemplates).toBe(false);
    });

    it('should have instructions for cleaning CDK templates', () => {
      // Check for a step that explains cleaning templates
      const hasCleaningInstructions = 
        readmeContent.includes('limpiar') || 
        readmeContent.includes('clean') ||
        readmeContent.includes('eliminar') && readmeContent.includes('CDKMetadata');

      const hasScriptReference = 
        readmeContent.includes('clean-cdk-template.sh') ||
        readmeContent.includes('clean-cdk-template.ps1');

      const counterexample = {
        hasCleaningInstructions,
        hasScriptReference,
        readmeLength: readmeContent.length,
      };

      console.log('\n=== Template Cleaning Instructions ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: Should have instructions for cleaning templates
      expect(hasCleaningInstructions).toBe(true);
      expect(hasScriptReference).toBe(true);
    });

    it('should explain why CDK templates cannot be used directly', () => {
      // Check for explanation of the bug/limitation
      const hasExplanation = 
        (readmeContent.includes('CDKMetadata') || readmeContent.includes('Conditions')) &&
        (readmeContent.includes('Modify') || readmeContent.includes('error') || 
         readmeContent.includes('no permitid'));

      const counterexample = {
        hasExplanation,
        mentionsCDKMetadata: readmeContent.includes('CDKMetadata'),
        mentionsModifyError: readmeContent.includes('Modify'),
      };

      console.log('\n=== Bug Explanation in README ===');
      console.log(JSON.stringify(counterexample, null, 2));

      // EXPECTED TO FAIL: Should explain why CDK templates cause issues
      expect(hasExplanation).toBe(true);
    });
  });

  describe('Cleaning Scripts Verification', () => {
    const scriptsDir = path.join(__dirname, '..', 'scripts');

    it('should have bash script for cleaning CDK templates', () => {
      const bashScriptPath = path.join(scriptsDir, 'clean-cdk-template.sh');
      const bashScriptExists = fs.existsSync(bashScriptPath);

      if (bashScriptExists) {
        const scriptContent = fs.readFileSync(bashScriptPath, 'utf-8');
        const removesProblematicSections = 
          scriptContent.includes('CDKMetadata') ||
          scriptContent.includes('Conditions') ||
          scriptContent.includes('Parameters') ||
          scriptContent.includes('Rules');

        console.log('\n=== Bash Cleaning Script Analysis ===');
        console.log({
          scriptExists: bashScriptExists,
          removesProblematicSections,
          scriptLength: scriptContent.length,
        });

        expect(removesProblematicSections).toBe(true);
      } else {
        console.log('\n=== Bash Cleaning Script Missing ===');
        console.log('Script does not exist:', bashScriptPath);
        
        // EXPECTED TO FAIL: Script should exist
        expect(bashScriptExists).toBe(true);
      }
    });

    it('should have PowerShell script for cleaning CDK templates', () => {
      const ps1ScriptPath = path.join(scriptsDir, 'clean-cdk-template.ps1');
      const ps1ScriptExists = fs.existsSync(ps1ScriptPath);

      if (ps1ScriptExists) {
        const scriptContent = fs.readFileSync(ps1ScriptPath, 'utf-8');
        const removesProblematicSections = 
          scriptContent.includes('CDKMetadata') ||
          scriptContent.includes('Conditions') ||
          scriptContent.includes('Parameters') ||
          scriptContent.includes('Rules');

        console.log('\n=== PowerShell Cleaning Script Analysis ===');
        console.log({
          scriptExists: ps1ScriptExists,
          removesProblematicSections,
          scriptLength: scriptContent.length,
        });

        expect(removesProblematicSections).toBe(true);
      } else {
        console.log('\n=== PowerShell Cleaning Script Missing ===');
        console.log('Script does not exist:', ps1ScriptPath);
        
        // EXPECTED TO FAIL: Script should exist
        expect(ps1ScriptExists).toBe(true);
      }
    });
  });
});
