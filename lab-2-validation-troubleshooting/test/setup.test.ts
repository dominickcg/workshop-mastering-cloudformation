/**
 * Setup verification test
 * 
 * This test verifies that the testing environment is properly configured
 * with fast-check and Jest.
 */

import * as fc from 'fast-check';

describe('Testing Environment Setup', () => {
  it('should have Jest configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should have fast-check available', () => {
    expect(fc).toBeDefined();
    expect(typeof fc.assert).toBe('function');
  });

  it('should run a simple property-based test', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      }),
      { numRuns: 100 }
    );
  });
});
