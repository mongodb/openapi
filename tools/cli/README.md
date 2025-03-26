# FoasCLI
FoasCLI is a Go-based CLI tool that provides commands for generating the Federated OpenAPI specification and the API changelog.

### Build From Source

#### Fetch Source

```bash
git clone https://github.com/mongodb/openapi.git
cd openapi/tools/cli
```

#### Build
To build `foascli`, run:

```bash
make build
```

The resulting `foascli` binary is placed in `./bin`.

## Usage
To get a list of available commands, run `foascli help`.

## Setup Environment
To set up the development environment, run:
```bash
make setup
```

### Run tests
To run unit and e2e tests, run:
```bash
make lint && unit-test && e2e-test
```

## Contributing

See our [CONTRIBUTING.md](../../CONTRIBUTING.md) guide.
