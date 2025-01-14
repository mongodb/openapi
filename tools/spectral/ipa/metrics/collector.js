import * as fs from 'node:fs';

export const EntryType = Object.freeze({
  EXCEPTION: 'exceptions',
  VIOLATION: 'violations',
  ADOPTION: 'adoptions',
});

class Collector {
  static instance = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Collector();
    }
    return this.instance;
  }

  constructor() {
    if (Collector.instance) {
      throw new Error('Use Collector.getInstance()');
    }

    this.entries = {
      [EntryType.VIOLATION]: [],
      [EntryType.ADOPTION]: [],
      [EntryType.EXCEPTION]: [],
    };

    this.fileName = 'ipa-collector-results-combined.log';

    process.on('exit', () => this.flushToFile());
    process.on('SIGINT', () => {
      this.flushToFile();
      process.exit();
    });
  }

  add(type, componentId, ruleName, exceptionReason = null ) {
    if (componentId && ruleName && type) {
      if (!Object.values(EntryType).includes(type)) {
        throw new Error(`Invalid entry type: ${type}`);
      }

      componentId = componentId.join('.');
      const entry = {componentId, ruleName};

      if(type === EntryType.EXCEPTION && exceptionReason) {
        entry.exceptionReason = exceptionReason;
      }

      this.entries[type].push(entry);
    }
  }

  flushToFile() {
    try {
      const data = JSON.stringify(this.entries, null, 2);
      fs.writeFileSync(this.fileName, data);
    } catch (error) {
      console.error('Error writing exceptions to file:', error);
    }
  }
}

const collector = Collector.getInstance();
export default collector;
