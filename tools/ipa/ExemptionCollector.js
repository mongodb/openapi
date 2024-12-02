class ExemptionCollector {
  constructor() {
    if (!ExemptionCollector.instance) {
      this.exemptions = [];
      console.log('ExemptionCollector instantiated'); // Debug log
      ExemptionCollector.instance = this; // Store the singleton instance
    }

    return ExemptionCollector.instance;
  }

  log(ruleName, context, details) {
    console.log('Adding to collector:', { ruleName, context, details });
    this.exemptions.push({
      rule: ruleName,
      path: context.path.join('.'),
      details,
    });
    console.log('Current exemptions:', this.exemptions);
  }

  getExemptions() {
    console.log('Retrieving exemptions:', this.exemptions);
    return this.exemptions;
  }
}

// Create a singleton collector
const exemptionCollector = new ExemptionCollector();
Object.freeze(exemptionCollector); // Prevent accidental modification
export default exemptionCollector;
