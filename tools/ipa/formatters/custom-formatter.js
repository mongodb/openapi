import { create } from 'xmlbuilder2';


export default async function customJUnitFormatter(results, document, spectral) {
  const allRules = spectral.ruleset.rules;
  const failedRules = new Set(results.map((result) => result.code));

  // Create a new XML document
  const xml = create({ version: '1.0' }) // Specify XML version
  .ele('testsuite', {
    name: 'SpectralLint',
    tests: Object.keys(allRules).length,
  });

  // Add test cases for each rule
  for (const ruleName of Object.keys(allRules)) {
    const rule = allRules[ruleName];
    const testCase = xml.ele('testcase', {
      classname: ruleName,
      name: rule.description || 'No description available',
      time: '0', // Default time
    });

    if (failedRules.has(ruleName)) {
      const failure = results.find((result) => result.code === ruleName);
      testCase.ele('failure', { type: ruleName }, failure.message);
    } else {
      testCase.ele('success'); // Mark as success for passed rules
    }
  }

  // Convert the XML structure to a string
  return xml.end({ prettyPrint: true });
}