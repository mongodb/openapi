package codespec

import (
	"github.com/mongodb/openapi/tools/codegen/stringcase"
)

type ElemType int

const (
	Bool ElemType = iota
	Float64
	Int64
	Number
	String
	CustomTypeJSON
	Unknown
)

type Model struct {
	Resources []Resource `yaml:"resources"`
}

type Resource struct {
	Name          stringcase.SnakeCaseString `yaml:",omitempty"`
	Operations    APIOperations              `yaml:"operations"`
	Schema        *Schema                    `yaml:"schema"`
	OpenApiSchema any                        `yaml:"openapi-schema"`
}

type APIOperations struct {
	Create        APIOperation `yaml:"create,omitempty"`
	Read          APIOperation `yaml:"read,omitempty"`
	Update        APIOperation `yaml:"update,omitempty"`
	Delete        APIOperation `yaml:"delete,omitempty"`
	VersionHeader string
}

type APIOperation struct {
	Wait              *Wait  `yaml:"wait,omitempty"`
	HTTPMethod        string `yaml:"httpMethod,omitempty"`
	Path              string `yaml:"path,omitempty"`
	StaticRequestBody string `yaml:"staticRequestBody,omitempty"`
}

type Wait struct {
	StateProperty     string   `yaml:"stateProperty,omitempty"`
	PendingStates     []string `yaml:"pendingStates,omitempty"`
	TargetStates      []string `yaml:"targetStates,omitempty"`
	TimeoutSeconds    int      `yaml:"timeoutSeconds,omitempty"`
	MinTimeoutSeconds int      `yaml:"minTimeoutSeconds,omitempty"`
	DelaySeconds      int      `yaml:"delaySeconds,omitempty"`
}

type Schema struct {
	Description        *string `yaml:"description,omitempty"`
	DeprecationMessage *string `yaml:"deprecationMessage,omitempty"`

	Attributes Attributes `yaml:"attributes,omitempty"`
}

type Attributes []Attribute

// Add this field to the Attribute struct
// Usage AttributeUsage
type Attribute struct {
	Set                      *SetAttribute              `yaml:"set,omitempty"`
	String                   *StringAttribute           `yaml:"string,omitempty"`
	Float64                  *Float64Attribute          `yaml:"float64,omitempty"`
	List                     *ListAttribute             `yaml:"list,omitempty"`
	Bool                     *BoolAttribute             `yaml:"bool,omitempty"`
	ListNested               *ListNestedAttribute       `yaml:"listNested,omitempty"`
	Map                      *MapAttribute              `yaml:"map,omitempty"`
	MapNested                *MapNestedAttribute        `yaml:"mapNested,omitempty"`
	Number                   *NumberAttribute           `yaml:"number,omitempty"`
	Int64                    *Int64Attribute            `yaml:"int64,omitempty"`
	Timeouts                 *TimeoutsAttribute         `yaml:"timeouts,omitempty"`
	SingleNested             *SingleNestedAttribute     `yaml:"singleNested,omitempty"`
	SetNested                *SetNestedAttribute        `yaml:"setNested,omitempty"`
	Description              *string                    `yaml:"description,omitempty"`
	DeprecationMessage       *string                    `yaml:"deprecationMessage,omitempty"`
	CustomType               *CustomType                `yaml:"customType,omitempty"`
	ComputedOptionalRequired ComputedOptionalRequired   `yaml:"computedOptionalRequired,omitempty"`
	Name                     stringcase.SnakeCaseString `yaml:",omitempty"`
	ReqBodyUsage             AttributeReqBodyUsage      `yaml:"reqBodyUsage,omitempty"`
	Sensitive                bool                       `yaml:"sensitive,omitempty"`
}

type AttributeReqBodyUsage int

const (
	AllRequestBodies = iota // by default attribute is sent in request bodies
	OmitInUpdateBody
	IncludeNullOnUpdate // attributes that always must be sent in update request body even if null
	OmitAlways          // this covers computed-only attributes and attributes which are only used for path/query params
)

type BoolAttribute struct {
	Default *bool
}
type Float64Attribute struct {
	Default *float64
}
type Int64Attribute struct {
	Default *int64
}
type MapAttribute struct {
	Default     *CustomDefault
	ElementType ElemType
}
type MapNestedAttribute struct {
	Default      *CustomDefault
	NestedObject NestedAttributeObject
}
type NumberAttribute struct {
	Default *CustomDefault
}
type SetAttribute struct {
	Default     *CustomDefault
	ElementType ElemType
}
type SetNestedAttribute struct {
	Default      *CustomDefault
	NestedObject NestedAttributeObject
}
type SingleNestedAttribute struct {
	Default      *CustomDefault
	NestedObject NestedAttributeObject
}
type StringAttribute struct {
	Default *string
}
type ListAttribute struct {
	Default     *CustomDefault
	ElementType ElemType
}
type ListNestedAttribute struct {
	Default      *CustomDefault
	NestedObject NestedAttributeObject
}
type NestedAttributeObject struct {
	Attributes Attributes
}

type TimeoutsAttribute struct {
	ConfigurableTimeouts []Operation
}

type Operation int

const (
	Create Operation = iota
	Update
	Read
	Delete
)

type CustomDefault struct {
	Definition string
	Imports    []string
}

type CustomType struct {
	Model  string
	Schema string
}

var CustomTypeJSONVar = CustomType{
	Model:  "jsontypes.Normalized",
	Schema: "jsontypes.NormalizedType{}",
}
