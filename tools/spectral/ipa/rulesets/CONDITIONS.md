<!--- NOTE: This file is generated, please see /scripts/generateRulesetReadme.js --->

# IPA Validation Conditions

A condition is a named, tested yes/no question about the part of the spec a rule is looking at, such as "is a singleton resource" or "is a 2xx response". Rules built with `defineRule` list the conditions they apply to, and the "Applies to" sections in the [rules README](./README.md) link here. Each entry says what the condition is evaluated on, gives examples that match and do not match (checked by the tests), and lists the rules that use it. To change where several rules apply, change the condition once. Conditions are defined in [rulesets/functions/utils/conditions](https://github.com/mongodb/openapi/tree/main/tools/spectral/ipa/rulesets/functions/utils/conditions); to add one, see [CONTRIBUTING.md](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/CONTRIBUTING.md). Only conditions used by at least one rule are listed.
