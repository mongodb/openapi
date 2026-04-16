package tools

import (
	"github.com/getkin/kin-openapi/openapi3"
)

// createTestSpec creates a comprehensive test OpenAPI spec shared across test files.
func createTestSpec() *openapi3.T {
	spec := &openapi3.T{
		OpenAPI: "3.0.0",
		Info: &openapi3.Info{
			Title:   "Test API",
			Version: "1.0.0",
		},
		Paths:      &openapi3.Paths{},
		Components: &openapi3.Components{},
		Tags: []*openapi3.Tag{
			{Name: "Users", Description: "User management endpoints"},
			{Name: "Clusters", Description: "Cluster operations"},
		},
	}

	spec.Paths.Set("/users", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "getUsers",
			Summary:     "Get all users",
			Description: "Retrieve a list of all users in the system",
			Tags:        []string{"Users"},
		},
		Post: &openapi3.Operation{
			OperationID: "createUser",
			Summary:     "Create a user",
			Description: "Create a new user account",
			Tags:        []string{"Users"},
		},
	})

	spec.Paths.Set("/users/{userId}", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "getUser",
			Summary:     "Get user by ID",
			Description: "Retrieve a specific user by their ID",
			Tags:        []string{"Users"},
		},
	})

	spec.Paths.Set("/clusters", &openapi3.PathItem{
		Post: &openapi3.Operation{
			OperationID: "createCluster",
			Summary:     "Create a new cluster",
			Description: "Creates a new cluster in the project",
			Tags:        []string{"Clusters"},
		},
		Get: &openapi3.Operation{
			OperationID: "listClusters",
			Summary:     "List clusters",
			Description: "Get all clusters in the project",
			Tags:        []string{"Clusters"},
		},
	})

	spec.Paths.Set("/clusters/{clusterId}", &openapi3.PathItem{
		Get: &openapi3.Operation{
			OperationID: "getCluster",
			Summary:     "Get cluster details",
			Description: "Retrieve details for a specific cluster",
			Tags:        []string{"Clusters"},
		},
	})

	spec.Components.Schemas = make(map[string]*openapi3.SchemaRef)
	spec.Components.Schemas["User"] = &openapi3.SchemaRef{
		Value: &openapi3.Schema{
			Type:        &openapi3.Types{"object"},
			Description: "User account information",
			Properties: map[string]*openapi3.SchemaRef{
				"userId":   {Value: &openapi3.Schema{Type: &openapi3.Types{"string"}}},
				"username": {Value: &openapi3.Schema{Type: &openapi3.Types{"string"}}},
				"email":    {Value: &openapi3.Schema{Type: &openapi3.Types{"string"}}},
			},
		},
	}

	spec.Components.Schemas["Cluster"] = &openapi3.SchemaRef{
		Value: &openapi3.Schema{
			Type:        &openapi3.Types{"object"},
			Description: "Cluster configuration",
			Properties: map[string]*openapi3.SchemaRef{
				"clusterId": {Value: &openapi3.Schema{Type: &openapi3.Types{"string"}}},
				"name":      {Value: &openapi3.Schema{Type: &openapi3.Types{"string"}}},
				"region":    {Value: &openapi3.Schema{Type: &openapi3.Types{"string"}}},
			},
		},
	}

	spec.Components.Schemas["Database"] = &openapi3.SchemaRef{
		Value: &openapi3.Schema{
			Type:        &openapi3.Types{"object"},
			Description: "Database information",
			Properties: map[string]*openapi3.SchemaRef{
				"databaseName": {Value: &openapi3.Schema{Type: &openapi3.Types{"string"}}},
			},
		},
	}

	spec.Components.Parameters = make(map[string]*openapi3.ParameterRef)
	spec.Components.Parameters["userId"] = &openapi3.ParameterRef{
		Value: &openapi3.Parameter{
			Name:        "userId",
			In:          "path",
			Description: "Unique identifier for the user",
			Required:    true,
		},
	}

	spec.Components.Parameters["clusterId"] = &openapi3.ParameterRef{
		Value: &openapi3.Parameter{
			Name:        "clusterId",
			In:          "path",
			Description: "Unique identifier for the cluster",
			Required:    true,
		},
	}

	spec.Components.Responses = make(map[string]*openapi3.ResponseRef)
	notFound := "Not Found"
	spec.Components.Responses["NotFound"] = &openapi3.ResponseRef{
		Value: &openapi3.Response{Description: &notFound},
	}

	unauthorized := "Unauthorized"
	spec.Components.Responses["Unauthorized"] = &openapi3.ResponseRef{
		Value: &openapi3.Response{Description: &unauthorized},
	}

	return spec
}
