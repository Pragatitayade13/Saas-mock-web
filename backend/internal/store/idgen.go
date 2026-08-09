package store

import (
	"fmt"
	"sync"
)

type IDGenerator struct {
	mu           sync.Mutex
	customerSeq  int64
	subSeq       int64
	txnSeq       int64
	notifSeq     int64
	userSeq      int64
	sessionSeq   int64
	reportSeq    int64
	actSeq       int64
	auditSeq     int64
}

func NewIDGenerator() *IDGenerator {
	return &IDGenerator{
		customerSeq: 1050,
		subSeq:      2050,
		txnSeq:      3150,
		notifSeq:    4050,
		userSeq:     5050,
		sessionSeq:  6050,
		reportSeq:   7050,
		actSeq:      8050,
		auditSeq:    9050,
	}
}

func (g *IDGenerator) NextCustomerID() string {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.customerSeq++
	return fmt.Sprintf("CUS-%d", g.customerSeq)
}

func (g *IDGenerator) NextSubscriptionID() string {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.subSeq++
	return fmt.Sprintf("SUB-%d", g.subSeq)
}

func (g *IDGenerator) NextTransactionID() string {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.txnSeq++
	return fmt.Sprintf("TXN-%d", g.txnSeq)
}

func (g *IDGenerator) NextNotificationID() string {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.notifSeq++
	return fmt.Sprintf("NOT-%d", g.notifSeq)
}

func (g *IDGenerator) NextUserID() string {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.userSeq++
	return fmt.Sprintf("USR-%d", g.userSeq)
}

func (g *IDGenerator) NextSessionID() string {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.sessionSeq++
	return fmt.Sprintf("SES-%d", g.sessionSeq)
}

func (g *IDGenerator) NextReportID() string {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.reportSeq++
	return fmt.Sprintf("RPT-%d", g.reportSeq)
}

func (g *IDGenerator) NextActivityID() string {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.actSeq++
	return fmt.Sprintf("ACT-%d", g.actSeq)
}

func (g *IDGenerator) NextAuditID() string {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.auditSeq++
	return fmt.Sprintf("AUD-%d", g.auditSeq)
}
