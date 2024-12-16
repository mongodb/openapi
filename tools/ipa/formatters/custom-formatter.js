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

    // Collect all results for this specific rule
    const ruleResults = results.filter((result) => result.code === ruleName);

    const testCase = xml.ele('testcase', {
      classname: ruleName,
      name: rule.description || 'No description available',
      time: '0',
    });

    if (failedRules.has(ruleName)) {
      // Add detailed failure information including components
      ruleResults.forEach((result) => {
        const failureDetails = testCase.ele('failure', {
          type: ruleName,
          path: result.path.join(".") || 'Unknown path'
        });

        // Include component and specific location details
        failureDetails.txt(JSON.stringify({
          message: result.message,
          component: result.path || 'Unknown',
          location: result.range
            ? `Line ${result.range.start.line}, Column ${result.range.start.character}`
            : 'No specific location',
        }, null, 2));
      });
    } else {
      testCase.ele('success', {
        description: 'All checks passed for this rule',
        type: ruleName
      });
    }
  }

  // Convert the XML structure to a string
  return xml.end({ prettyPrint: true });
}