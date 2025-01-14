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

    this.fileName = "combined.log"

    process.on('exit', () => this.flushToFile());
    process.on('SIGINT', () => {
      this.flushToFile();
      process.exit();
    });
  }

  add(componentId, ruleName, type) {
    if(componentId && ruleName && type) {
      componentId = componentId.join('.');
      const data = {componentId, ruleName};
      this.entries[type].push(data);
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
