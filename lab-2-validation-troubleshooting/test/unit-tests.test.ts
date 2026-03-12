import * as fs from 'fs';
import * as path from 'path';

/**
 * Unit Tests for Lab 2: Early Validation & Troubleshooting
 * 
 * These tests verify the content and structure of documentation files,
 * support scripts, and configuration files for the lab.
 */

describe('Unit Tests - Lab 2 Validation & Troubleshooting', () => {
  const labRoot = path.join(__dirname, '..');
  
  // Helper function to read file content
  const readFile = (relativePath: string): string => {
    const fullPath = path.join(labRoot, relativePath);
    return fs.readFileSync(fullPath, 'utf-8');
  };

  // Helper function to check if file exists
  const fileExists = (relativePath: string): boolean => {
    const fullPath = path.join(labRoot, relativePath);
    return fs.existsSync(fullPath);
  };

  // Helper function to check file permissions (Unix-like systems)
  const isExecutable = (relativePath: string): boolean => {
    const fullPath = path.join(labRoot, relativePath);
    try {
      fs.accessSync(fullPath, fs.constants.X_OK);
      return true;
    } catch {
      return false;
    }
  };

  describe('7.1 Tests de contenido del README.md', () => {
    let readmeContent: string;

    beforeAll(() => {
      readmeContent = readFile('README.md');
    });

    test('README contiene título con emoji', () => {
      // Check for emoji at the start of the title
      expect(readmeContent).toMatch(/^#\s*🔍/m);
      expect(readmeContent).toContain('Laboratorio 2');
    });

    test('README contiene índice con anchor links', () => {
      // Check for table of contents with anchor links
      expect(readmeContent).toContain('## Índice');
      expect(readmeContent).toMatch(/\[.*\]\(#.*\)/); // Markdown anchor link pattern
    });

    test('README contiene tiempo estimado "30 minutos"', () => {
      expect(readmeContent).toContain('30 minutos');
    });

    test('README contiene prerrequisitos con referencia a Lab 1', () => {
      expect(readmeContent).toContain('## Prerrequisitos');
      expect(readmeContent).toContain('lab-1-stack-refactoring');
    });

    test('README contiene verificación de región como primer paso', () => {
      expect(readmeContent).toContain('## Paso 1: Verificar Región y Entorno');
      // Check that region verification is in the first step
      const paso1Match = readmeContent.match(/## Paso 1:.*?(?=## Paso 2:|$)/s);
      expect(paso1Match).toBeTruthy();
      if (paso1Match) {
        expect(paso1Match[0]).toContain('región');
      }
    });

    test('README contiene comando `aws configure get region`', () => {
      expect(readmeContent).toContain('aws configure get region');
    });

    test('README contiene checkpoints "✓ Verificación"', () => {
      expect(readmeContent).toMatch(/✓\s*Verificación/);
      // Should have multiple checkpoints
      const checkpoints = readmeContent.match(/✓\s*Verificación/g);
      expect(checkpoints).toBeTruthy();
      expect(checkpoints!.length).toBeGreaterThan(1);
    });

    test('README contiene referencia a TROUBLESHOOTING.md', () => {
      expect(readmeContent).toContain('TROUBLESHOOTING.md');
    });

    test('README contiene nota sobre mantener recursos para Lab 3', () => {
      expect(readmeContent).toMatch(/Lab.*3/i);
      expect(readmeContent).toMatch(/NO\s+elimine/i);
    });

    test('README contiene diagrama Mermaid (bloque ```mermaid)', () => {
      expect(readmeContent).toContain('```mermaid');
    });

    test('README contiene referencia a imagen ![Arquitectura](./assets/arquitectura-lab2.png)', () => {
      expect(readmeContent).toContain('![Arquitectura](./assets/arquitectura-lab2.png)');
    });
  });

  describe('7.2 Tests de archivos de soporte', () => {
    test('Script `generate-diagram.py` existe en `assets/`', () => {
      expect(fileExists('assets/generate-diagram.py')).toBe(true);
    });

    test('Imagen `arquitectura-lab2.png` existe en `assets/`', () => {
      expect(fileExists('assets/arquitectura-lab2.png')).toBe(true);
    });

    test('Script `restrict-permissions.sh` existe en `scripts/`', () => {
      expect(fileExists('scripts/restrict-permissions.sh')).toBe(true);
    });

    test('Script `restore-permissions.sh` existe en `scripts/`', () => {
      expect(fileExists('scripts/restore-permissions.sh')).toBe(true);
    });

    test('Ambos scripts tienen permisos de ejecución', () => {
      // Note: This test may not work on Windows
      if (process.platform !== 'win32') {
        expect(isExecutable('scripts/restrict-permissions.sh')).toBe(true);
        expect(isExecutable('scripts/restore-permissions.sh')).toBe(true);
      } else {
        // On Windows, just check that files exist
        expect(fileExists('scripts/restrict-permissions.sh')).toBe(true);
        expect(fileExists('scripts/restore-permissions.sh')).toBe(true);
      }
    });
  });

  describe('7.3 Tests de contenido del TROUBLESHOOTING.md', () => {
    let troubleshootingContent: string;

    beforeAll(() => {
      troubleshootingContent = readFile('TROUBLESHOOTING.md');
    });

    test('TROUBLESHOOTING contiene sección "Bucket name already exists"', () => {
      expect(troubleshootingContent).toMatch(/Bucket name already exists/i);
    });

    test('TROUBLESHOOTING contiene sección "AccessDenied on lambda:CreateFunction"', () => {
      expect(troubleshootingContent).toMatch(/AccessDenied.*lambda:CreateFunction/i);
    });

    test('TROUBLESHOOTING contiene sección "Operation ID not found"', () => {
      expect(troubleshootingContent).toMatch(/Operation ID not found/i);
    });

    test('TROUBLESHOOTING contiene sección "Stack is in UPDATE_ROLLBACK_COMPLETE"', () => {
      expect(troubleshootingContent).toMatch(/UPDATE_ROLLBACK_COMPLETE/);
    });

    test('TROUBLESHOOTING contiene instrucciones para notificar al instructor', () => {
      expect(troubleshootingContent).toMatch(/notifique.*instructor/i);
    });
  });

  describe('7.4 Tests de contenido del .gitignore', () => {
    let gitignoreContent: string;

    beforeAll(() => {
      gitignoreContent = readFile('.gitignore');
    });

    test('.gitignore excluye archivos IDE (.idea/, .vscode/, *.swp)', () => {
      expect(gitignoreContent).toContain('.idea/');
      expect(gitignoreContent).toContain('.vscode/');
      expect(gitignoreContent).toContain('*.swp');
    });

    test('.gitignore excluye archivos OS (.DS_Store, Thumbs.db)', () => {
      expect(gitignoreContent).toContain('.DS_Store');
      expect(gitignoreContent).toContain('Thumbs.db');
    });

    test('.gitignore excluye logs (*.log, npm-debug.log*)', () => {
      expect(gitignoreContent).toContain('*.log');
      expect(gitignoreContent).toContain('npm-debug.log*');
    });

    test('.gitignore excluye archivos temporales (*.tmp, *.temp)', () => {
      expect(gitignoreContent).toContain('*.tmp');
      expect(gitignoreContent).toContain('*.temp');
    });

    test('.gitignore excluye variables de entorno (.env)', () => {
      expect(gitignoreContent).toContain('.env');
    });

    test('.gitignore NO excluye scripts .sh', () => {
      // Should not have a pattern that excludes all .sh files
      expect(gitignoreContent).not.toMatch(/^\*\.sh$/m);
      expect(gitignoreContent).not.toMatch(/^\.sh$/m);
    });

    test('.gitignore NO excluye archivos .md', () => {
      // Should not have a pattern that excludes all .md files
      expect(gitignoreContent).not.toMatch(/^\*\.md$/m);
      expect(gitignoreContent).not.toMatch(/^\.md$/m);
    });
  });

  describe('7.5 Tests de estructura de scripts IAM', () => {
    let restrictScript: string;
    let restoreScript: string;

    beforeAll(() => {
      restrictScript = readFile('scripts/restrict-permissions.sh');
      restoreScript = readFile('scripts/restore-permissions.sh');
    });

    test('`restrict-permissions.sh` contiene política JSON con `Effect: Deny`', () => {
      expect(restrictScript).toContain('"Effect": "Deny"');
    });

    test('`restrict-permissions.sh` contiene `Action: lambda:CreateFunction`', () => {
      expect(restrictScript).toContain('"Action": "lambda:CreateFunction"');
    });

    test('`restrict-permissions.sh` usa comando `aws iam put-role-policy`', () => {
      expect(restrictScript).toContain('aws iam put-role-policy');
    });

    test('`restore-permissions.sh` usa comando `aws iam delete-role-policy`', () => {
      expect(restoreScript).toContain('aws iam delete-role-policy');
    });

    test('Ambos scripts validan parámetro de nombre de participante', () => {
      // Check for parameter validation in both scripts
      expect(restrictScript).toMatch(/PARTICIPANT_NAME.*\$\{1[:\?]/);
      expect(restoreScript).toMatch(/PARTICIPANT_NAME.*\$\{1[:\?]/);
      
      // Check for error message when parameter is missing
      expect(restrictScript).toMatch(/Error.*participante/i);
      expect(restoreScript).toMatch(/Error.*participante/i);
    });
  });
});
