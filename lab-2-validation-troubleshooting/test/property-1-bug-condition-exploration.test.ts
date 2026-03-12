/**
 * Property 1: Bug Condition Exploration - CLI Command Incorrectness Detection
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * This test searches for incorrect `describe-stack-events --operation-id` references
 * in the documentation files. The correct command is `describe-events --operation-id`.
 * 
 * Expected behavior (after fix):
 * - README.md Mermaid diagram should show `describe-events --operation-id`
 * - README.md concepts summary should show `describe-events --operation-id`
 * - TROUBLESHOOTING.md should use `describe-events` (not `describe-stack-events`)
 *   in all sections related to operation-id troubleshooting
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Property 1: Bug Condition - CLI Command Correctness', () => {
  const readmeContent = fs.readFileSync(
    path.join(__dirname, '../README.md'),
    'utf-8'
  );
  
  const troubleshootingContent = fs.readFileSync(
    path.join(__dirname, '../TROUBLESHOOTING.md'),
    'utf-8'
  );

  describe('README.md - Mermaid Diagram', () => {
    test('should use correct describe-events command in Mermaid diagram troubleshooting node', () => {
      // Requirement 2.1: Mermaid diagram should show correct command
      
      // Extract the Mermaid diagram section
      const mermaidMatch = readmeContent.match(/```mermaid[\s\S]*?```/);
      expect(mermaidMatch).toBeTruthy();
      
      const mermaidContent = mermaidMatch![0];
      
      // The diagram should NOT contain the incorrect command
      expect(mermaidContent).not.toContain('describe-stack-events --operation-id');
      
      // The diagram SHOULD contain the correct command
      expect(mermaidContent).toContain('describe-events --operation-id');
    });
  });

  describe('README.md - Concepts Summary', () => {
    test('should use correct describe-events command in concepts summary section', () => {
      // Requirement 2.2: Concepts summary should show correct command
      
      // Extract the "Resumen de Conceptos Aprendidos" section
      const summaryMatch = readmeContent.match(/## Resumen de Conceptos Aprendidos[\s\S]*?(?=\n## |$)/);
      expect(summaryMatch).toBeTruthy();
      
      const summaryContent = summaryMatch![0];
      
      // The summary should NOT contain the incorrect command
      expect(summaryContent).not.toContain('describe-stack-events --operation-id');
      
      // The summary SHOULD contain the correct command
      expect(summaryContent).toContain('describe-events --operation-id');
    });
  });

  describe('TROUBLESHOOTING.md - AccessDenied Section', () => {
    test('should use correct describe-events command in AccessDenied troubleshooting', () => {
      // Requirement 2.3: AccessDenied section should show correct command
      
      // Extract the AccessDenied section
      const accessDeniedMatch = troubleshootingContent.match(
        /### Error: AccessDenied on lambda:CreateFunction[\s\S]*?(?=\n### |---\n\n## )/
      );
      expect(accessDeniedMatch).toBeTruthy();
      
      const accessDeniedContent = accessDeniedMatch![0];
      
      // The section should NOT contain describe-stack-events with operation-id context
      expect(accessDeniedContent).not.toContain('describe-stack-events');
      
      // The section SHOULD contain the correct command
      expect(accessDeniedContent).toContain('describe-events');
    });
  });

  describe('TROUBLESHOOTING.md - Operation ID Not Found Section', () => {
    test('should use correct describe-events command in Operation ID troubleshooting', () => {
      // Requirement 2.4: Operation ID section should show correct command
      
      // Extract the "Operation ID not found" section
      const operationIdMatch = troubleshootingContent.match(
        /### Error: Operation ID not found[\s\S]*?(?=\n### |---\n\n## )/
      );
      expect(operationIdMatch).toBeTruthy();
      
      const operationIdContent = operationIdMatch![0];
      
      // The section should NOT contain describe-stack-events in operation-id context
      // Check both the symptom description and solution steps
      expect(operationIdContent).not.toContain('describe-stack-events');
      
      // The section SHOULD contain the correct command
      expect(operationIdContent).toContain('describe-events');
    });
  });

  describe('TROUBLESHOOTING.md - Rollback Complete Section', () => {
    test('should use correct describe-events command in Rollback troubleshooting note', () => {
      // Requirement 2.5: Rollback section should show correct command
      
      // Extract the "Stack is in UPDATE_ROLLBACK_COMPLETE state" section
      const rollbackMatch = troubleshootingContent.match(
        /### Error: Stack is in UPDATE_ROLLBACK_COMPLETE state[\s\S]*?(?=\n### |---\n\n## )/
      );
      expect(rollbackMatch).toBeTruthy();
      
      const rollbackContent = rollbackMatch![0];
      
      // The section should NOT contain describe-stack-events
      expect(rollbackContent).not.toContain('describe-stack-events');
      
      // The section SHOULD contain the correct command reference
      expect(rollbackContent).toContain('describe-events');
    });
  });

  describe('Global Documentation Consistency', () => {
    test('should not contain any describe-stack-events with operation-id references', () => {
      // Requirement 2.6: No incorrect command references should exist
      
      // Search for the incorrect pattern in both files
      const incorrectPatternRegex = /describe-stack-events[^\n]*operation-id/gi;
      
      const readmeMatches = readmeContent.match(incorrectPatternRegex);
      const troubleshootingMatches = troubleshootingContent.match(incorrectPatternRegex);
      
      // Document any counterexamples found
      if (readmeMatches) {
        console.log('Counterexamples found in README.md:');
        readmeMatches.forEach((match, index) => {
          console.log(`  ${index + 1}. "${match}"`);
        });
      }
      
      if (troubleshootingMatches) {
        console.log('Counterexamples found in TROUBLESHOOTING.md:');
        troubleshootingMatches.forEach((match, index) => {
          console.log(`  ${index + 1}. "${match}"`);
        });
      }
      
      // The test should fail if any incorrect patterns are found
      expect(readmeMatches).toBeNull();
      expect(troubleshootingMatches).toBeNull();
    });
  });
});
