import * as fs from 'node:fs';

export const EntryType = Object.freeze({
  EXCEPTION: 'exceptions',
  VIOLATION: 'violations',
  ADOPTION: 'adoptions',
});

class Collector {
  static instance;

  constructor() {
    if (Collector.instance) {
      return Collector.instance;
    }

    this.entries = {
      [EntryType.VIOLATION]: [],
      [EntryType.ADOPTION]: [],
      [EntryType.EXCEPTION]: [],
    };
    this.fileName = "combined.log"
    //this.exceptionFileName = 'exceptions.log';
    //this.violationFileName = 'violations.log';
    //this.adoptionFileName = 'adoptions.log';


    process.on('exit', () => this.flushToFile());
    process.on('SIGINT', () => {
      this.flushToFile();
      process.exit(); // Ensure process exits on Ctrl+C
    });

    Collector.instance = this;
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

const collector = new Collector();
export default collector;
