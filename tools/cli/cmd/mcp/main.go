// Copyright 2025 MongoDB Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Package main provides the entry point for the OpenAPI Filter MCP Server.
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/cli/internal/mcp/registry"
	"github.com/mongodb/openapi/tools/cli/internal/mcp/resources"
	"github.com/mongodb/openapi/tools/cli/internal/mcp/tools"
	"github.com/mongodb/openapi/tools/cli/internal/version"
)

const (
	serverName = "openapi-filter-mcp"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigChan
		log.Println("Shutting down MCP server...")
		cancel()
	}()

	// Create the spec registry
	reg := registry.New()

	// Create the MCP server
	server := mcp.NewServer(
		&mcp.Implementation{
			Name:    serverName,
			Version: version.Version,
		},
		&mcp.ServerOptions{
			Capabilities: &mcp.ServerCapabilities{
				Tools: &mcp.ToolCapabilities{
					ListChanged: true,
				},
				Resources: &mcp.ResourceCapabilities{
					ListChanged: true,
				},
			},
		},
	)

	// Register tools
	tools.RegisterTools(server, reg)

	// Register resources
	resources.RegisterResources(server, reg)

	log.Printf("Starting %s v%s", serverName, version.Version)

	// Run the server over stdio
	if err := server.Run(ctx, &mcp.StdioTransport{}); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
