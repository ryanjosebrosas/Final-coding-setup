import { describe, it, expect } from 'vitest';
import { reverse, capitalize, truncate } from './strings';

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

describe('capitalize', () => {
  it('should capitalize first letter of each word', () => {
    expect(capitalize('hello world')).toBe('Hello World');
  });

  it('should return empty string for empty input', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle single word', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should handle already capitalized string', () => {
    expect(capitalize('Hello World')).toBe('Hello World');
  });

  it('should handle mixed case string', () => {
    expect(capitalize('hElLo wOrLd')).toBe('HElLo WOrLd');
  });
});

describe('truncate', () => {
  it('should truncate string and add ellipsis when over maxLength', () => {
    expect(truncate('hello world', 5)).toBe('he...');
  });

  it('should return original string when fits within maxLength', () => {
    expect(truncate('hi', 10)).toBe('hi');
  });

  it('should return empty string for empty input', () => {
    expect(truncate('', 5)).toBe('');
  });

  it('should handle exact maxLength boundary', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('should handle maxLength exactly equal to ellipsis length', () => {
    expect(truncate('hello', 3)).toBe('...');
  });

  it('should handle maxLength less than ellipsis length', () => {
    expect(truncate('hello', 2)).toBe('he');
    expect(truncate('hello', 1)).toBe('h');
    expect(truncate('hello', 0)).toBe('');
  });
});
