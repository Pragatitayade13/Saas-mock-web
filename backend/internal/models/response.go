package models

// APIResponse represents a standard success response wrapper.
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

// APIErrorDetails holds structural details for error responses.
type APIErrorDetails struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// APIErrorResponse represents a standard error response wrapper.
type APIErrorResponse struct {
	Success bool            `json:"success"`
	Error   APIErrorDetails `json:"error"`
}

// HealthResponse represents the health check API response.
type HealthResponse struct {
	Success bool   `json:"success"`
	Status  string `json:"status"`
	Service string `json:"service"`
}

// ApiInfoResponse represents metadata regarding the Nexora API.
type ApiInfoResponse struct {
	Success     bool   `json:"success"`
	Service     string `json:"service"`
	Version     string `json:"version"`
	Environment string `json:"environment"`
}
