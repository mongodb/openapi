import { beforeEach, describe, expect, it } from '@jest/globals';
import collector, { EntryType } from '../../metrics/collector';
import * as fs from 'node:fs';

jest.mock('node:fs');

describe('Collector Class', () => {
  const expectedOutput = {
    violations: [
      { componentId: 'example.component', ruleName: 'rule-1' },
      { componentId: 'example.component', ruleName: 'rule-2' },
    ],
    adoptions: [{ componentId: 'example.component', ruleName: 'rule-3' }],
    exceptions: [{ componentId: 'example.component', ruleName: 'rule-4' }],
  };

  beforeEach(() => {
    collector.entries = {
      [EntryType.VIOLATION]: [],
      [EntryType.ADOPTION]: [],
      [EntryType.EXCEPTION]: [],
    };

    jest.clearAllMocks();
  });

  it('should collect violations, adoptions, and exceptions correctly', () => {
    collector.add(['example', 'component'], 'rule-1', EntryType.VIOLATION);
    collector.add(['example', 'component'], 'rule-2', EntryType.VIOLATION);
    collector.add(['example', 'component'], 'rule-3', EntryType.ADOPTION);
    collector.add(['example', 'component'], 'rule-4', EntryType.EXCEPTION);

    expect(collector.entries).toEqual(expectedOutput);

    collector.flushToFile();
    const writtenData = JSON.stringify(expectedOutput, null, 2);
    expect(fs.writeFileSync).toHaveBeenCalledWith('combined.log', writtenData);
  });

  it('should not add invalid entries', () => {
    collector.add(null, 'rule-1', EntryType.VIOLATION);
    collector.add(['example', 'component'], null, EntryType.ADOPTION);
    collector.add(['example', 'component'], 'rule-4', null);

    expect(collector.entries).toEqual({
      violations: [],
      adoptions: [],
      exceptions: [],
    });

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
