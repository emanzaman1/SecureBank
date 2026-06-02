# SecureBank - SABSA Security Architecture Layer
**Phase 2 - Security Architecture Design**

---

## Executive Summary

**SABSA** (Sherwood Applied Business Security Architecture) is a business-driven, risk-focused, architecture-centric methodology for developing information security strategies and enterprise architectures.

This document documents SecureBank's security architecture across all 6 SABSA layers: Business, Conceptual, Logical, Physical, Component, and Operational.

---

## SABSA Framework Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Business Layer                                         │
│ WHAT IS NEEDED FOR BUSINESS SUCCESS?                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: Conceptual Layer                                       │
│ WHAT ARE THE PRINCIPLES & CONCEPTS?                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: Logical Layer                                          │
│ WHAT LOGICAL ARCHITECTURE SUPPORTS THE CONCEPTS?                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: Physical Layer                                         │
│ WHAT PHYSICAL COMPONENTS IMPLEMENT THE LOGICAL DESIGN?          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 5: Component Layer                                        │
│ WHAT ARE THE DETAILED SPECIFICATIONS & CONFIGURATIONS?          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layer 6: Operational Layer                                      │
│ HOW IS IT MANAGED, MONITORED, & MAINTAINED?                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Business Architecture

### Business Drivers
```
BUSINESS OBJECTIVES:
├─ Protect customer funds & privacy
├─ Maintain customer trust
├─ Comply with banking regulations
├─ Ensure 99.99% uptime
└─ Minimize security incident costs

BUSINESS RISKS MITIGATED:
├─ Financial loss from fraud
├─ Reputational damage from breach
├─ Regulatory fines & penalties
├─ Customer dissatisfaction
└─ Business interruption

SECURITY GOALS:
├─ Confidentiality: Protect customer data
├─ Integrity: Prevent unauthorized changes
├─ Availability: Keep system running 24/7
├─ Authenticity: Verify user identity
└─ Non-repudiation: Prove actions taken
```

### Business Requirements
```
Security Policies:
├─ All customer data must be encrypted
├─ Access control based on role
├─ All actions must be logged & auditable
├─ Security incidents require immediate response
├─ Annual security assessments required
├─ Employee security training mandatory
└─ Third-party vendors must be vetted

Compliance Requirements:
├─ Banking regulations (country-specific)
├─ Data protection laws (GDPR-like)
├─ PCI DSS (if handling credit cards)
├─ ISO 27001 (information security)
└─ SOC 2 Type II (for audit certification)
```

### Business Context
```
Target Users:
├─ Bank Customers (retail users)
├─ Bank Employees (admins)
├─ External partners (third-party integrations)
└─ Regulators (compliance auditors)

Assets Protected:
├─ Customer accounts & balances
├─ Transaction history
├─ Personal information (PII)
├─ Banking credentials
└─ System infrastructure
```

---

## Layer 2: Conceptual Architecture

### Security Principles
```
1. ZERO TRUST
   └─ Never trust, always verify
      Every user, device, service must prove identity

2. DEFENSE IN DEPTH
   └─ Multiple security layers
      If one layer fails, others catch the threat

3. LEAST PRIVILEGE
   └─ Users get minimum permissions needed
      Customers can't become admins
      Services can't access unrelated data

4. SECURITY BY DESIGN
   └─ Security built in from start
      Not added later (security patches)
      Secure defaults in all configurations

5. TRANSPARENCY & AUDITABILITY
   └─ All actions logged & traceable
      Can prove what happened & when
      Regulatory compliance ready
```

### Conceptual Security Model
```
┌─────────────────────────────────────────────────────────────┐
│               SECURITY CONTROL FRAMEWORK                    │
└─────────────────────────────────────────────────────────────┘

┌─ PREVENTIVE CONTROLS
│  ├─ Authentication: Who are you?
│  ├─ Authorization: What can you do?
│  ├─ Encryption: Can't read if stolen
│  ├─ Input Validation: Reject bad data
│  └─ Rate Limiting: Stop brute force
│
├─ DETECTIVE CONTROLS
│  ├─ Logging: Record all actions
│  ├─ Monitoring: Watch for anomalies
│  ├─ Alerting: Notify on incidents
│  ├─ Auditing: Prove compliance
│  └─ Forensics: Investigate breaches
│
├─ CORRECTIVE CONTROLS
│  ├─ Incident Response: Stop the attack
│  ├─ Remediation: Fix the problem
│  ├─ Patch Management: Apply fixes
│  └─ Account Recovery: Restore access
│
└─ COMPENSATING CONTROLS
   ├─ Backups: Recover from disaster
   ├─ Failover: Switch to backup system
   ├─ Monitoring Override: Manual review
   └─ Escalation: Get human approval
```

### Trust Boundaries
```
TRUST BOUNDARY 1: External Internet
  Customer Browser                         Untrusted
  ↓ (HTTPS/TLS 1.3) ↓
  API Gateway (Rate Limiting, WAF)        Trusted Boundary
  
TRUST BOUNDARY 2: Internal Network
  API Gateway                              Partially Trusted
  ↓ (mTLS, JWT Verification) ↓
  Microservices (Auth, Account)           Trusted Boundary
  
TRUST BOUNDARY 3: Data Layer
  Microservices                            Partially Trusted
  ↓ (Encrypted Connection) ↓
  Database, Cache, Vault                  Trusted Boundary
```

### Conceptual Control Mapping
```
THREATS                    CONTROLS
├─ Unauthorized Access  → Authentication (JWT RS256)
├─ Data Theft           → Encryption (TLS 1.3, AES-256)
├─ Unauthorized Changes → Authorization (RBAC)
├─ Brute Force          → Rate Limiting
├─ Injection Attacks    → Input Validation (Parameterized Queries)
├─ XSS Attacks          → Output Encoding (DOMPurify, CSP)
├─ Account Takeover     → Account Lockout, MFA (future)
├─ Data Breach          → Encryption at Rest, Backups
├─ Insider Threat       → Audit Logging, Access Control
└─ Service Downtime     → Monitoring, High Availability
```

---

## Layer 3: Logical Architecture

### Security Domains
```
DOMAIN 1: Identity & Access Management
├─ Function: Authenticate users, issue tokens, enforce roles
├─ Technology: FastAPI Auth Service, JWT, RBAC
├─ Data: User credentials, roles, permissions
├─ Threat: Credential theft, privilege escalation

DOMAIN 2: Application Services
├─ Function: Process business logic securely
├─ Technology: FastAPI Account Service, Notification Service
├─ Data: Account info, transaction data
├─ Threat: Logic bypass, unauthorized operations

DOMAIN 3: Data Protection
├─ Function: Encrypt and protect data
├─ Technology: PostgreSQL (encrypted), Redis (TLS), Vault
├─ Data: Customer data, encryption keys
├─ Threat: Data theft, key compromise

DOMAIN 4: Network & Infrastructure
├─ Function: Isolate services, manage traffic
├─ Technology: Kubernetes, NetworkPolicies, TLS
├─ Data: Network traffic, service definitions
├─ Threat: Lateral movement, MITM attacks

DOMAIN 5: Monitoring & Detection
├─ Function: Detect and respond to threats
├─ Technology: Prometheus, Falco, QRadar, ELK
├─ Data: Logs, metrics, alerts
├─ Threat: Missed incidents, slow response
```

### Logical Data Flow

```
CUSTOMER LOGIN FLOW:
User Input (username/password)
  ↓
[DOMAIN 1: IAM]
  ├─ Receive credentials (HTTPS/TLS) ✓
  ├─ Validate format
  ├─ Hash & compare password (bcrypt) ✓
  ├─ Issue JWT token (RS256) ✓
  ↓
[DOMAIN 5: Monitoring]
  ├─ Log successful login
  ├─ Check for anomalies
  ↓
Return JWT to user
  ↓
User stored JWT in memory (not localStorage) ✓

SUBSEQUENT API REQUEST FLOW:
User sends JWT in Authorization header
  ↓
[DOMAIN 4: Network]
  ├─ Receive HTTPS request ✓
  ├─ Rate limit check
  ↓
[DOMAIN 1: IAM]
  ├─ Extract JWT from header
  ├─ Verify RS256 signature ✓
  ├─ Check expiration ✓
  ├─ Check revocation list ✓
  ↓
[DOMAIN 2: Application]
  ├─ Extract user_id from JWT
  ├─ Process business logic
  ├─ Validate object ownership (BOLA check) ✓
  ├─ Query database (TLS 1.3) ✓
  ↓
[DOMAIN 3: Data Protection]
  ├─ Database returns encrypted data
  ├─ Decrypt response (authorized only)
  ↓
[DOMAIN 5: Monitoring]
  ├─ Log successful access
  ├─ Record metrics
  ↓
Return data to user (encrypted)
```

### Logical Security Architecture
```
┌──────────────────────────────────────────────────────────┐
│ SECURITY ZONES                                           │
└──────────────────────────────────────────────────────────┘

EXTERNAL ZONE (Internet)
  ├─ Customer Browsers
  ├─ Mobile Apps
  └─ Third-party APIs
           │
    FIREWALL / WAF
           │
           ▼
DMZ ZONE (Demilitarized)
  ├─ API Gateway
  ├─ Load Balancer
  └─ HTTPS Termination
           │
    NETWORK POLICY (K8s)
           │
           ▼
TRUSTED ZONE (Kubernetes)
  ├─ Auth Service
  ├─ Account Service
  ├─ Notification Service
  └─ Monitoring Stack
           │
    NETWORK POLICY (K8s)
           │
           ▼
DATA ZONE (Protected)
  ├─ PostgreSQL Database
  ├─ Redis Cache
  ├─ Vault Secrets
  └─ Backups
```

---

## Layer 4: Physical Architecture

### Technology Stack

```
LAYER 4: PHYSICAL COMPONENTS

┌─ WEB TIER (Presentation)
│  ├─ React Frontend (Vite)
│  ├─ Running on: Browser (Client-side)
│  └─ Security: DOMPurify, CSP Headers
│
├─ APPLICATION TIER (Business Logic)
│  ├─ Auth Service (FastAPI)
│  ├─ Account Service (FastAPI)
│  ├─ Notification Service (Node.js)
│  ├─ Running on: Kubernetes containers
│  └─ Security: mTLS, RBAC, Input Validation
│
├─ API GATEWAY TIER
│  ├─ Kong API Gateway (or equivalent)
│  ├─ Rate Limiting
│  ├─ JWT Validation
│  └─ Security: TLS 1.3, WAF rules
│
├─ DATA TIER (Persistence)
│  ├─ PostgreSQL Database (primary)
│  ├─ Redis Cache (TLS)
│  ├─ Running on: Kubernetes StatefulSets
│  └─ Security: Encrypted connections, access control
│
├─ SECRETS TIER
│  ├─ HashiCorp Vault
│  ├─ Stores: API keys, database credentials, encryption keys
│  └─ Security: TLS, encryption, audit logging
│
└─ INFRASTRUCTURE TIER
   ├─ Kubernetes Cluster
   ├─ Docker Containers
   ├─ Persistent Volumes (encrypted)
   └─ Security: RBAC, NetworkPolicies, Pod Security
```

### Physical Deployment Diagram

```
PRODUCTION ENVIRONMENT:

┌─────────────────────────────────────────────────────────────┐
│                         KUBERNETES CLUSTER                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  INGRESS (TLS 1.3)                                   │  │
│  │  └─ Route HTTPS → Services                           │  │
│  └──────────────────────────────────────────────────────┘  │
│           │                   │                   │         │
│           ▼                   ▼                   ▼         │
│  ┌────────────────┐ ┌────────────────┐ ┌──────────────┐   │
│  │Auth Service    │ │Account Service │ │Notification  │   │
│  │Pod 1, Pod 2    │ │Pod 1, Pod 2    │ │Service       │   │
│  │(Replicated)    │ │(Replicated)    │ │              │   │
│  └────────────────┘ └────────────────┘ └──────────────┘   │
│           │                   │                   │         │
│           └───────────────────┼───────────────────┘         │
│                               │                             │
│                  ┌────────────┼────────────┐               │
│                  ▼            ▼            ▼               │
│           ┌─────────────────────────────────────┐          │
│           │  POSTGRES DB   │  REDIS  │  VAULT   │          │
│           │  (StatefulSet) │ (Cache) │ (Secrets)│          │
│           │  Encrypted     │ (TLS)   │  (Vault) │          │
│           └─────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MONITORING & LOGGING                               │  │
│  │  ├─ Prometheus (metrics)                            │  │
│  │  ├─ Falco (runtime security)                        │  │
│  │  ├─ Fluentd (log collection)                        │  │
│  │  └─ ELK Stack (log storage & visualization)         │  │
│  └──────────────────────────────────────────────────────┘  │
│           │                                                │
│           ▼                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SIEM (QRadar)                                       │  │
│  │  ├─ Receive logs from all services                  │  │
│  │  ├─ Correlate events                                │  │
│  │  └─ Generate alerts & incidents                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 5: Component Architecture

### Component Security Specifications

#### Auth Service Component
```
NAME: Auth Service (FastAPI)
SECURITY REQUIREMENTS:
├─ Input Validation
│  ├─ Username: 3-50 chars, alphanumeric + underscore
│  ├─ Email: RFC 5322 format
│  ├─ Password: Min 12 chars, mixed case, numbers, special chars
│  └─ Rate limit: 5 attempts per 5 minutes per IP
├─ Processing
│  ├─ Hash password with bcrypt (cost ≥ 12)
│  ├─ Generate JWT with RS256 (asymmetric)
│  ├─ Include claims: sub, role, exp, iat, jti
│  └─ Store failed attempts in Redis
├─ Output Security
│  ├─ Never return passwords or secrets
│  ├─ Generic error messages
│  └─ Log security events (to Fluentd)
└─ Dependencies
   ├─ FastAPI framework (auto ASGI security)
   ├─ SQLAlchemy ORM (prevent SQL injection)
   ├─ python-jose (JWT handling)
   ├─ passlib (bcrypt hashing)
   └─ pydantic (input validation)
```

#### Account Service Component
```
NAME: Account Service (FastAPI)
SECURITY REQUIREMENTS:
├─ Input Validation
│  ├─ Account ID: UUID format
│  ├─ Transfer amount: Numeric, > 0
│  ├─ Recipient: Valid account
│  └─ Notes: Max 500 chars, sanitize
├─ Authorization
│  ├─ Verify JWT on every request
│  ├─ Check JWT.sub == requested_account_id (BOLA)
│  ├─ Return 403 if unauthorized
│  └─ Log failed access attempts
├─ Processing
│  ├─ Use transactions (ACID compliance)
│  ├─ Prevent double-spending
│  ├─ Encrypt all data at rest
│  └─ Audit all transfers
└─ Dependencies
   ├─ FastAPI
   ├─ SQLAlchemy with encryption
   ├─ Kafka client (publish events)
   └─ Logging (audit trail)
```

#### Notification Service Component
```
NAME: Notification Service (Node.js)
SECURITY REQUIREMENTS:
├─ Input Validation
│  ├─ Email address: RFC 5322
│  ├─ Message: Max 1000 chars
│  └─ Rate limit: 5 emails per user per hour
├─ Authentication
│  ├─ Verify JWT from message queue
│  ├─ Only process authorized events
│  └─ Log all attempts
├─ Processing
│  ├─ Sanitize message content (DOMPurify)
│  ├─ Encrypt message in transit (TLS)
│  ├─ Use secure SMTP (TLS, not unencrypted)
│  └─ Retry failed sends with backoff
└─ Dependencies
   ├─ Express.js
   ├─ Kafka consumer
   ├─ Nodemailer (SMTP)
   ├─ dotenv (secrets management)
   └─ Winston (logging)
```

---

## Layer 6: Operational Architecture

### Operations & Maintenance

#### Secrets Management
```
HOW ARE SECRETS STORED?
├─ Vault Integration
│  ├─ Database credentials → Vault
│  ├─ API keys → Vault
│  ├─ Encryption keys → Vault
│  └─ JWT signing keys → Vault
├─ Secret Rotation
│  ├─ Database credentials: Every 90 days
│  ├─ API keys: Every 180 days
│  ├─ Encryption keys: Periodic review
│  └─ JWT key pairs: Annual rotation
└─ Access Control
   ├─ Only services that need secrets can access
   ├─ Audit logging for all access
   └─ MFA for manual access
```

#### Monitoring & Observability
```
WHAT IS MONITORED?
├─ Application Metrics
│  ├─ API response time (p50, p95, p99)
│  ├─ Request error rate (4xx, 5xx)
│  ├─ Failed authentication attempts
│  ├─ Failed authorization attempts
│  └─ Rate limit violations
├─ System Metrics
│  ├─ CPU usage per service
│  ├─ Memory usage per service
│  ├─ Disk usage (databases, logs)
│  └─ Network bandwidth
├─ Security Metrics
│  ├─ Number of alerts per day
│  ├─ MTTR (Mean Time To Respond)
│  ├─ MTTI (Mean Time To Identify)
│  └─ Vulnerability count by severity
└─ Business Metrics
   ├─ Transaction success rate
   ├─ User registration rate
   ├─ API availability (uptime)
   └─ Customer satisfaction
```

#### Logging & Audit Trail
```
WHAT IS LOGGED?
├─ Authentication Events
│  ├─ Successful login: user_id, timestamp, IP
│  ├─ Failed login: username, timestamp, IP, attempt #
│  ├─ Account lockout: user_id, timestamp, reason
│  └─ Password reset: user_id, timestamp, method
├─ Authorization Events
│  ├─ Successful access: user_id, resource, action
│  ├─ Unauthorized attempts: user_id, resource, action
│  ├─ Role changes: user_id, old_role, new_role, changed_by
│  └─ Permission denials: user_id, resource, reason
├─ Data Events
│  ├─ Account creation: user_id, timestamp
│  ├─ Transfer: from_account, to_account, amount
│  ├─ Data export: user_id, data_type, timestamp
│  └─ Configuration changes: admin_id, what_changed, when
└─ Security Events
   ├─ Intrusion attempts: IP, attack_type, timestamp
   ├─ Rate limit hits: IP, endpoint, timestamp
   ├─ XSS attempts: user_id, payload, endpoint
   └─ SQL injection attempts: user_id, payload, endpoint

LOG RETENTION:
├─ Application logs: 90 days
├─ Security logs: 1 year
├─ Audit logs: 3+ years (regulatory)
└─ Backup logs: 5+ years
```

#### Incident Response
```
WHEN SECURITY INCIDENT OCCURS:
1. DETECT (Falco + QRadar)
   └─ Alert sent to security team
2. RESPOND (On-call team)
   └─ Isolate affected service
   └─ Prevent further damage
3. INVESTIGATE
   └─ Review logs (ELK)
   └─ Determine root cause
4. REMEDIATE
   └─ Fix vulnerability
   └─ Deploy patch
   └─ Re-test
5. COMMUNICATE
   └─ Notify affected customers
   └─ File report with regulators
6. IMPROVE
   └─ Add monitoring rule
   └─ Update security controls
```

#### Disaster Recovery
```
BACKUP STRATEGY:
├─ Daily automated backups
├─ Encrypted backups (AES-256)
├─ Off-site backup storage
├─ Backup testing quarterly
└─ RTO (Recovery Time Objective): 4 hours
└─ RPO (Recovery Point Objective): 1 hour

FAILOVER STRATEGY:
├─ Multi-region deployment
├─ Database replication
├─ Load balancer failover
├─ Automatic health checks
└─ RTO: 15 minutes
```

---

## SABSA Control Matrix

```
BUSINESS LAYER    → Business Requirements, Risk Profile, Compliance
     ↓
CONCEPTUAL LAYER  → Security Principles, Threats, Controls (What)
     ↓
LOGICAL LAYER     → Architecture Design, Data Flows (How)
     ↓
PHYSICAL LAYER    → Technology Selection, Deployment
     ↓
COMPONENT LAYER   → Configuration, Specifications, Testing
     ↓
OPERATIONAL LAYER → Monitoring, Maintenance, Incident Response
```

---

## Security Architecture Verification

```
CHECKLIST:
├─ BUSINESS LAYER
│  ├─ [ ] All compliance requirements identified
│  ├─ [ ] Business risks mapped to controls
│  └─ [ ] Stakeholder approval obtained
├─ CONCEPTUAL LAYER
│  ├─ [ ] Zero Trust principles applied
│  ├─ [ ] Defense in depth implemented
│  └─ [ ] Least privilege enforced
├─ LOGICAL LAYER
│  ├─ [ ] Security domains defined
│  ├─ [ ] Data flows documented
│  └─ [ ] Trust boundaries identified
├─ PHYSICAL LAYER
│  ├─ [ ] Technology stack selected
│  ├─ [ ] Deployment architecture designed
│  └─ [ ] High availability planned
├─ COMPONENT LAYER
│  ├─ [ ] Security specs for each component
│  ├─ [ ] Testing requirements defined
│  └─ [ ] Dependencies documented
└─ OPERATIONAL LAYER
   ├─ [ ] Monitoring strategy implemented
   ├─ [ ] Logging configured
   ├─ [ ] Incident response plan ready
   └─ [ ] DR/BC plan documented
```

---

## Success Criteria (Phase 2)

- ✅ SABSA architecture documented across 6 layers
- ✅ Security controls mapped to threats
- ✅ Technology stack aligned with requirements
- ✅ Operational procedures defined
- ✅ Team approval obtained
- ✅ Ready for Phase 3 implementation

---

**Status**: Phase 2 - SABSA Security Architecture Complete
**Next**: Phase 3 - Implementation & Testing
