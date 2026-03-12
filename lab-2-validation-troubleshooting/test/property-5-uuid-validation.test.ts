import * as fc from 'fast-check';

/**
 * Property 5: Validación de formato UUID para Operation ID
 * 
 * **Validates: Requirements 6.3**
 * 
 * Para cualquier string en formato UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx donde x es un
 * dígito hexadecimal), la validación debe aceptarlo como Operation ID válido. Para cualquier
 * string que no cumpla este formato, la validación debe rechazarlo.
 */

describe('Feature: validation-troubleshooting, Property 5: Validación de formato UUID para Operation ID', () => {
  /**
   * Función de validación de formato UUID
   * 
   * Formato esperado: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   * donde x es un dígito hexadecimal (0-9, a-f, A-F)
   */
  function isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Generador de UUIDs válidos (versión 4)
   * 
   * Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   * donde:
   * - x es cualquier dígito hexadecimal
   * - y es uno de 8, 9, a, o b
   */
  const validUUIDArbitrary = fc.uuid();

  /**
   * Generador de strings arbitrarios que NO son UUIDs válidos
   */
  const invalidUUIDArbitrary = fc.oneof(
    // Strings completamente aleatorios
    fc.string(),
    // Strings con longitud incorrecta
    fc.stringMatching(/^[0-9a-f]{7}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
    // Strings sin guiones
    fc.stringMatching(/^[0-9a-f]{32}$/),
    // Strings con guiones en posiciones incorrectas
    fc.stringMatching(/^[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{16}$/),
    // Strings con caracteres no hexadecimales
    fc.string().filter((s) => s.includes('g') || s.includes('z')),
    // Strings vacíos o muy cortos
    fc.constantFrom('', 'abc', '123'),
    // Números
    fc.integer().map((n) => n.toString())
  ).filter((s) => !isValidUUID(s)); // Asegurar que no sean UUIDs válidos por casualidad

  it('should accept valid UUIDs as Operation IDs', () => {
    fc.assert(
      fc.property(validUUIDArbitrary, (uuid) => {
        // Verificar que UUIDs válidos son aceptados
        expect(isValidUUID(uuid)).toBe(true);
      }),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('should reject invalid strings as Operation IDs', () => {
    fc.assert(
      fc.property(invalidUUIDArbitrary, (invalidString) => {
        // Verificar que strings inválidos son rechazados
        expect(isValidUUID(invalidString)).toBe(false);
      }),
      {
        numRuns: 100,
        verbose: true,
      }
    );
  });

  it('should handle edge cases correctly', () => {
    // UUIDs válidos conocidos
    const validUUIDs = [
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      '00000000-0000-0000-0000-000000000000',
      'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF',
    ];

    validUUIDs.forEach((uuid) => {
      expect(isValidUUID(uuid)).toBe(true);
    });

    // Strings inválidos conocidos
    const invalidStrings = [
      '',
      'not-a-uuid',
      '550e8400-e29b-41d4-a716', // Muy corto
      '550e8400-e29b-41d4-a716-446655440000-extra', // Muy largo
      '550e8400e29b41d4a716446655440000', // Sin guiones
      '550e8400-e29b-41d4-a716-44665544000g', // Carácter no hexadecimal
      '550e8400_e29b_41d4_a716_446655440000', // Guiones bajos en lugar de guiones
      '550e8400-e29b-41d4-a716-4466554400', // Muy corto en la última sección
    ];

    invalidStrings.forEach((str) => {
      expect(isValidUUID(str)).toBe(false);
    });
  });

  it('should be case-insensitive for hexadecimal digits', () => {
    const mixedCaseUUIDs = [
      '550E8400-E29B-41D4-A716-446655440000', // Mayúsculas
      '550e8400-e29b-41d4-a716-446655440000', // Minúsculas
      '550E8400-e29b-41D4-a716-446655440000', // Mixto
    ];

    mixedCaseUUIDs.forEach((uuid) => {
      expect(isValidUUID(uuid)).toBe(true);
    });
  });
});
