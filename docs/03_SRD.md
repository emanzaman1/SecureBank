# SecureBank - Security Requirements Document (SRD)

## Overview
SecureBank is a secure online banking platform built with security-by-design principles.

## Security Requirements

### Authentication
- JWT-based authentication (RS256)
- Password minimum 12 characters
- Bcrypt hashing with cost factor ≥ 12
- Session timeout: 30 minutes
- Account lockout after 5 failed attempts

### Encryption
- TLS 1.3 for all communications
- AES-256 for data at rest
- No sensitive data in logs

### Input Validation
- Parameterized queries (SQLAlchemy ORM)
- Email validation (RFC 5322)
- Length limits on all inputs
- Output encoding on display

### Access Control (RBAC)
- Two roles: customer, admin
- Least privilege principle
- JWT role validation on every request

### Monitoring & Logging
- Log all authentication events
- Log failed authorization attempts
- 90-day log retention
- SIEM integration (QRadar)

## Framework Mapping

### NIST CSF
- Identify: Threat modeling (MITRE ATT&CK)
- Protect: Encryption, RBAC, rate limiting
- Detect: Monitoring, logging, alerts
- Respond: Account lockout, incident response
- Recover: Backups, disaster recovery

### OWASP ASVS
- V2: Authentication requirements
- V3: Session management
- V5: Input validation
- V8: Data protection
- V14: Configuration

---

**Status**: Phase 1 - SRD Template
