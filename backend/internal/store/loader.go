package store

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

func LoadSeedDataFromJSON(mockDataDir string) (SeedData, error) {
	var seed SeedData

	usersFile := filepath.Join(mockDataDir, "users.json")
	usersData, err := os.ReadFile(usersFile)
	if err != nil {
		return seed, fmt.Errorf("failed to read %s: %w", usersFile, err)
	}
	if err := json.Unmarshal(usersData, &seed.Users); err != nil {
		return seed, fmt.Errorf("invalid json format in %s: %w", usersFile, err)
	}

	customersFile := filepath.Join(mockDataDir, "customers.json")
	custData, err := os.ReadFile(customersFile)
	if err != nil {
		return seed, fmt.Errorf("failed to read %s: %w", customersFile, err)
	}
	if err := json.Unmarshal(custData, &seed.Customers); err != nil {
		return seed, fmt.Errorf("invalid json format in %s: %w", customersFile, err)
	}

	subscriptionsFile := filepath.Join(mockDataDir, "subscriptions.json")
	subData, err := os.ReadFile(subscriptionsFile)
	if err != nil {
		return seed, fmt.Errorf("failed to read %s: %w", subscriptionsFile, err)
	}
	if err := json.Unmarshal(subData, &seed.Subscriptions); err != nil {
		return seed, fmt.Errorf("invalid json format in %s: %w", subscriptionsFile, err)
	}

	transactionsFile := filepath.Join(mockDataDir, "transactions.json")
	txnData, err := os.ReadFile(transactionsFile)
	if err != nil {
		return seed, fmt.Errorf("failed to read %s: %w", transactionsFile, err)
	}
	if err := json.Unmarshal(txnData, &seed.Transactions); err != nil {
		return seed, fmt.Errorf("invalid json format in %s: %w", transactionsFile, err)
	}

	notificationsFile := filepath.Join(mockDataDir, "notifications.json")
	notifData, err := os.ReadFile(notificationsFile)
	if err != nil {
		return seed, fmt.Errorf("failed to read %s: %w", notificationsFile, err)
	}
	if err := json.Unmarshal(notifData, &seed.Notifications); err != nil {
		return seed, fmt.Errorf("invalid json format in %s: %w", notificationsFile, err)
	}

	// Validation
	if len(seed.Users) == 0 {
		return seed, fmt.Errorf("validation error: users dataset is empty")
	}
	if len(seed.Customers) == 0 {
		return seed, fmt.Errorf("validation error: customers dataset is empty")
	}
	if len(seed.Subscriptions) == 0 {
		return seed, fmt.Errorf("validation error: subscriptions dataset is empty")
	}
	if len(seed.Transactions) == 0 {
		return seed, fmt.Errorf("validation error: transactions dataset is empty")
	}
	if len(seed.Notifications) == 0 {
		return seed, fmt.Errorf("validation error: notifications dataset is empty")
	}

	return seed, nil
}

func (s *MemoryStore) LoadMockDataAndReset(mockDataDir string) error {
	seed, err := LoadSeedDataFromJSON(mockDataDir)
	if err != nil {
		return err
	}
	return s.ResetStore(seed)
}
