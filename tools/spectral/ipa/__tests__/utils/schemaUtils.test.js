import { splitCamelCase } from '../../rulesets/functions/utils/schemaUtils.js';
import { describe, expect, it } from '@jest/globals';

describe('splitCamelCase', () => {
  it('should split basic camelCase strings', () => {
    expect(splitCamelCase('camelCase')).toEqual(['camel', 'case']);
    expect(splitCamelCase('thisIsCamelCase')).toEqual(['this', 'is', 'camel', 'case']);
  });

  it('should handle single-word strings', () => {
    expect(splitCamelCase('word')).toEqual(['word']);
    expect(splitCamelCase('Word')).toEqual(['word']);
  });

  it('should handle strings with numbers', () => {
    expect(splitCamelCase('user123Name')).toEqual(['user123', 'name']);
    expect(splitCamelCase('user123name')).toEqual(['user123name']);
  });

  it('should handle empty strings', () => {
    expect(splitCamelCase('')).toEqual(['']);
  });

  it('should handle edge cases from the project', () => {
    expect(splitCamelCase('project')).toEqual(['project']);
    expect(splitCamelCase('projectId')).toEqual(['project', 'id']);
    expect(splitCamelCase('myProjectDetails')).toEqual(['my', 'project', 'details']);
    expect(splitCamelCase('projection')).toEqual(['projection']);
  });
});
