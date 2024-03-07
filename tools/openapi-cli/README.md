# openapi-cli
CLI to merge openapi 3.x specifications

```bash
openapicli merge --help                                                                                                                                                       
Merge Open API specifications into a base spec.

Usage:
  openapicli merge [base-spec] [spec-1] [spec-2] [spec-3] ... [spec-n] [flags]

Flags:
  -h, --help            help for merge
  -o, --output string   File name of the merged spec (default "federated.json")
```



### Build From Source

#### Fetch Source

```bash
git clone git@github.com:andreaangiolillo/openapi-cli.gi
cd openapi-cli
```

#### Build

To build `openapicli`, run:

```bash
make build
```

The resulting `openapicli` binary is placed in `./bin`.


#### Run
```bash
./bin/openapicli merge test/data/latest-mms-v2-spec-without-search.json test/data/atlas_search.json -o test/data/federated.json
Federated Spec was saved in 'test/data/federated.json'
```
