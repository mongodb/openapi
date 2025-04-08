# IPA Validation

The IPA validation uses [Spectral](https://docs.stoplight.io/docs/spectral/9ffa04e052cc1-spectral-cli) to validate the [MongoDB Atlas Admin API OpenAPI Specification](https://github.com/mongodb/openapi/tree/main/openapi). The rules cover MongoDB best-practices for API design.

**Note:** For MongoDB engineers, please review https://go/ipa-validation for additional information.

## Running Locally

### Prerequisites

- Node.js >= v20
- npm

### Run Validation

To run the IPA validation locally, install necessary dependencies with `npm install` if you haven't already. Then, simply run:

```
npm run ipa-validation
```

This command will run Spectral CLI for the ruleset [ipa-spectral.yaml](https://github.com/mongodb/openapi/blob/main/tools/spectral/ipa/ipa-spectral.yaml) on the raw [v2.yaml](https://github.com/mongodb/openapi/blob/main/openapi/.raw/v2.yaml) OpenAPI spec.

The Spectral CLI can also be used to run the validation on any valid OpenAPI file (`json` or `yaml`).

```
spectral lint {path/to/oas/file} --ruleset=./tools/spectral/ipa/ipa-spectral.yaml
```

## Integrating IPA Validations

To incorporate the IPA Spectral ruleset for OpenAPI specification validation in your repositories, you can follow these implementation approaches:

### Installation Options

#### Server-based Installation

You can reference our ruleset directly in your `.spectral.yaml` file without installation:

```
extends:
- https://raw.githubusercontent.com/mongodb/openapi/<latest-git-commit-sha>/tools/spectral/ipa/ipa-spectral.yaml
```

#### Package-based Installation

Not supported yet

### Integration Methods

#### Local Configuration

Create a `.spectral.yaml` file that extends our ruleset:

```
extends:
- https://raw.githubusercontent.com/mongodb/openapi/<latest-git-commit-sha>/tools/spectral/ipa/ipa-spectral.yaml
```

For more information about how to extend rulesets, see the [web page](https://meta.stoplight.io/docs/spectral/83527ef2dd8c0-extending-rulesets).

#### Customization Options

You can override specific rules from our ruleset by adding them to your local `.spectral.yaml`:

```
extends:
- https://raw.githubusercontent.com/mongodb/openapi/<latest-git-commit-sha>/tools/spectral/ipa/ipa-spectral.yaml

overrides:
    - files:
        '**#/components/schemas/ExampleSchema'
        '**#/paths/example-path'
       rules:
         x-xgen-IPA-xxx-rule: 'off'
```

### CI/CD Integration

#### GitHub Actions Example

If you use GitHub Actions, you can define a workflow step to include IPA validation, such as

```
- name: IPA validation action
run: npx spectral lint <openapi-spec-file> --ruleset=<spectral-ruleset-file>
```

or

```
    - name: IPA validation - Spectral GitHub action
      uses: stoplightio/spectral-action@2ad0b9302e32a77c1caccf474a9b2191a8060d83
      with:
        file_glob: <openapi-spec-file>
        spectral_ruleset: <spectral-ruleset-file>
```

`<spectral-ruleset-file>` is the ruleset file which extends the IPA Spectral ruleset.

For more information about Spectral GitHub action, see the [GitHub repo](https://github.com/stoplightio/spectral-action).

#### Shell Script Example

You can create a validation script similar to this:

```
#!/bin/bash
spectral lint <openapi-spec-file> --ruleset=<spectral-ruleset-file>
if [ $? -ne 0 ]; then
echo "API validation failed"
exit 1
fi
```

For more information on Spectral CLI, see the [web page](https://meta.stoplight.io/docs/spectral/9ffa04e052cc1-spectral-cli).

#### Bazel Target Example

You can create a Bazel target using the shell script similar to:

```
sh_binary(
name = "ipa_validation",
srcs = ["ipa_validation.sh"],
data = [
":spectral",
":spectral_config",
],
deps = [
"@bazel_tools//tools/bash/runfiles",
],
)
```
