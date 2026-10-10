package customcheckers

import (
	"github.com/oasdiff/oasdiff/checker"
	"github.com/oasdiff/oasdiff/diff"
)

const (
	XXgenOperationIdOverrideAddedId    = "api-x-xgen-operation-id-override-added"
	XXgenOperationIdOverrideRemovedId  = "api-x-xgen-operation-id-override-removed"
	XXgenOperationIdOverrideModifiedId = "api-x-xgen-operation-id-override-modified"
)

func APIXXgenOperationIdOverrideUpdatedCheck(diffReport *diff.Diff, operationsSources *diff.OperationsSourcesMap, config *checker.Config) checker.Changes {
	result := make(checker.Changes, 0)
	if diffReport.PathsDiff == nil {
		return result
	}

	for path, pathItem := range diffReport.PathsDiff.Modified {
		if pathItem.OperationsDiff == nil {
			continue
		}

		for operation, operationItem := range pathItem.OperationsDiff.Modified {
			if operationItem.ExtensionsDiff.Empty() {
				continue
			}

			if operationItem.ExtensionsDiff.Modified["x-xgen-operation-id-override"] != nil {
				result = append(result, checker.NewApiChange(
					XXgenOperationIdOverrideModifiedId,
					config,
					[]any{operationItem.Base.Extensions["x-xgen-operation-id-override"], operationItem.Revision.Extensions["x-xgen-operation-id-override"]},
					"",
					operationsSources,
					pathItem.Base.GetOperation(operation),
					operation,
					path,
				))
			}

			if operationItem.ExtensionsDiff.Deleted.Contains("x-xgen-operation-id-override") {
				result = append(result, checker.NewApiChange(
					XXgenOperationIdOverrideRemovedId,
					config,
					[]any{operationItem.Base.Extensions["x-xgen-operation-id-override"]},
					"",
					operationsSources,
					pathItem.Base.GetOperation(operation),
					operation,
					path,
				))
			}

			if operationItem.ExtensionsDiff.Added.Contains("x-xgen-operation-id-override") {
				result = append(result, checker.NewApiChange(
					XXgenOperationIdOverrideAddedId,
					config,
					[]any{operationItem.Revision.Extensions["x-xgen-operation-id-override"]},
					"",
					operationsSources,
					pathItem.Revision.GetOperation(operation),
					operation,
					path,
				))
			}
		}
	}
	return result
}
