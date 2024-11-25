// rules-repo/functions/hitTracker.js

const fs = require('fs');
const path = require('path');

const RuleTracker = {
  hits: new Map(),
  noMatches: new Set(),

  trackRule(ruleName, given, results) {
    if (!this.hits.has(ruleName)) {
      this.hits.set(ruleName, {
        matches: 0,
        violations: 0,
        elements: new Set(),
        paths: new Set()
      });
    }

    if (!given || (Array.isArray(given) && given.length === 0)) {
      this.noMatches.add(ruleName);
      return;
    }

    const stats = this.hits.get(ruleName);
    stats.matches++;
    if (results && results.length > 0) {
      stats.violations++;
      // Track paths where violations occurred
      results.forEach(result => {
        if (result.path) {
          stats.paths.add(result.path);
        }
      });
    }

    if (typeof given === 'object') {
      Object.keys(given).forEach(path => {
        stats.elements.add(path);
      });
    } else {
      stats.elements.add(String(given));
    }

    // Write report to CI_REPORT_PATH if environment variable is set
    if (process.env.CI_REPORT_PATH) {
      this.writeReport(process.env.CI_REPORT_PATH);
    }
  },

  getReport() {
    return {
      ruleStats: Object.fromEntries([...this.hits.entries()].map(([rule, stats]) => [
        rule,
        {
          totalMatches: stats.matches,
          violations: stats.violations,
          elements: Array.from(stats.elements),
          violationPaths: Array.from(stats.paths)
        }
      ])),
      noMatches: Array.from(this.noMatches),
      timestamp: new Date().toISOString(),
      summary: {
        totalRules: this.hits.size + this.noMatches.size,
        rulesWithMatches: this.hits.size,
        rulesWithNoMatches: this.noMatches.size,
        totalViolations: [...this.hits.values()].reduce((sum, stat) => sum + stat.violations, 0)
      }
    };
  },

  writeReport(reportPath) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(this.getReport(), null, 2));
  }
};

const withTracking = (ruleName, originalRule) => (given, options, context) => {
  const results = originalRule(given, options, context);
  RuleTracker.trackRule(ruleName, given, results);
  return results;
};

module.exports = { RuleTracker, withTracking };