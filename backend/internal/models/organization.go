package models

import "time"

type Organization struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	Logo      string    `json:"logo,omitempty"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone,omitempty"`
	Website   string    `json:"website,omitempty"`
	Industry  string    `json:"industry,omitempty"`
	Timezone  string    `json:"timezone"`
	Currency  string    `json:"currency"`
	Country   string    `json:"country"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
