package main

import (
	"context"
	"log"
	"os"

	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/mongodb/openapi/tools/mcp-server/internal/registry"
	"github.com/mongodb/openapi/tools/mcp-server/internal/resources"
	"github.com/mongodb/openapi/tools/mcp-server/internal/tools"
)

const (
	serverName    = "openapi-mcp-server"
	serverVersion = "0.1.0"
)

func main() {
	if err := run(); err != nil {
		log.Fatalf("Error: %v", err)
	}
}

func run() error {
	reg := registry.New()

	impl := &mcp.Implementation{
		Name:    serverName,
		Version: serverVersion,
	}
	server := mcp.NewServer(impl, nil)

	tools.Register(server, reg)
	resources.Register(server, reg)

	// Log to stderr (stdout is reserved for MCP protocol)
	log.SetOutput(os.Stderr)
	log.Printf("Starting %s v%s", serverName, serverVersion)

	transport := &mcp.StdioTransport{}
	session, err := server.Connect(context.Background(), transport, nil)
	if err != nil {
		return err
	}

	return session.Wait()
}
