import { describe, it, expect } from 'vitest';
import { reverse } from './strings';

describe('reverse', () => {
  it('should reverse a string', () => {
    expect(reverse('hello')).toBe('olleh');
  });

  it('should return empty string for empty input', () => {
    expect(reverse('')).toBe('');
  });

  it('should handle single character', () => {
    expect(reverse('a')).toBe('a');
  });

  it('should handle palindrome', () => {
    expect(reverse('radar')).toBe('radar');
  });

  it('should handle string with spaces', () => {
    expect(reverse('hello world')).toBe('dlrow olleh');
  });
});
