// Copyright 2026 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Package diff compares OpenAPI documents using the compatibility rules
// defined by FOAS.
//
// The package deliberately does not expose oasdiff types. Callers receive a
// stable FOAS report that can be consumed by the changelog generator, OASIS,
// CLIs, or other Go applications.
//
// To add a custom compatibility rule:
//   - implement a checker in a dedicated check_<rule>.go file;
//   - describe it with newCustomRule, including its FOAS message formatter;
//   - add it to registeredCustomRules;
//   - add focused checker and report tests;
//   - increment RulesetVersion when the observable classification changes.
//
// Rules sharing one checker handler are executed once. The registry rejects
// duplicate IDs, collisions with built-in oasdiff rules, missing metadata,
// unsupported severities, and nil handlers or message formatters.
package diff
