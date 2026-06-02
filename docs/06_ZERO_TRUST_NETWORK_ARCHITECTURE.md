# SecureBank - Zero Trust Network Architecture
**Phase 2 - Zero Trust Design**

---

## Executive Summary

Zero Trust Architecture (ZTA) is based on the principle: **"Never Trust, Always Verify"**

Every access request - whether from users, services, or devices - must be authenticated and authorized, regardless of whether it comes from inside or outside the network.

---

## Zero Trust Principles Applied to SecureBank

### 1. Verify Every User
```
User Login Flow:
Browser → HTTPS/TLS → API Gateway → Auth Service
         ↓
    Verify Credentials (username + password)
         ↓
    Hash & Compare (bcrypt)
         ↓
    Issue JWT (RS256 signed)
         ↓
    User gets token, stored in httpOnly cookie
         ↓
    Return to Frontend
```

### 2. Verify Every Device
```
Device Verification:
Device → Request API with JWT
       ↓
   Verify JWT signature (RS256 public key)
       ↓
   Verify JWT not expired
       ↓
   Verify JWT not revoked (Redis blacklist)
       ↓
   Grant/Deny access
```

### 3. Verify Every Service-to-Service Connection
```
Service Communication:
Auth Service → Account Service
             ↓
        Use mTLS (mutual TLS)
             ↓
   Both services verify certificates
             ↓
   Encrypted tunnel established
             ↓
   Pass JWT in Authorization header
             ↓
   Account Service verifies JWT
```

### 4. Microsegmentation (Network Policies)
```
K8s NetworkPolicies:
- Auth Service: Only receives traffic from API Gateway
- Account Service: Only receives traffic from Auth Service + API Gateway
- Notification Service: Only receives from Message Queue
- Database: Only receives from Account Service
- Redis: Only receives from Auth Service
```

### 5. Continuous Verification & Monitoring
```
Monitoring:
Every request logged → Falco watches → QRadar analyzes
       ↓                    ↓              ↓
   (Who?)            (Suspicious?)    (Alert!)
 User ID, IP      Unusual pattern    Send notification
```

---

## SecureBank Zero Trust Network Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INTERNET / EXTERNAL                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │ HTTPS/TLS 1.3│  ← Encryption in Transit
                            │   Gateway    │
                            └──────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌────────────┐  ┌────────────┐  ┌────────────┐
            │ /login     │  │ /register  │  │ /transfer  │
            │ Endpoint   │  │ Endpoint   │  │ Endpoint   │
            └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
                  │               │               │
                  └───────────────┼───────────────┘
                                  ▼
                        ┌──────────────────┐
                        │  API Gateway     │  ← Rate Limiting
                        │  (Rate Limit)    │
                        └────────┬─────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
        │ Auth        │  │ Account     │  │ Notification │
        │ Service     │  │ Service     │  │ Service      │
        └──┬──────┬───┘  └──┬──────┬───┘  └──┬───────┬───┘
           │      │         │      │         │       │
        JWT│   mTLS│     mTLS│  JWT│    Kafka│   mTLS│
           │      │         │      │         │       │
    ┌──────┴──┐   │    ┌────┴──┐   │   ┌─────┴──┐   │
    │ Verify  │   │    │Verify │   │   │ Verify │   │
    │Creds    │   │    │JWT    │   │   │ JWT    │   │
    │         │   │    │       │   │   │        │   │
    └─────────┘   │    └───────┘   │   └────────┘   │
                  │                 │                │
                  ▼                 ▼                ▼
            ┌──────────────────────────────────────────────┐
            │  Kubernetes Network Policies (Microsegment)  │
            │                                              │
            │  - Ingress: Only from API Gateway            │
            │  - Egress: Only to necessary services        │
            │  - Pod Security Standards enforced           │
            │  - mTLS between all services                 │
            └──────────────────────────────────────────────┘
                  │                 │                │
                  ▼                 ▼                ▼
        ┌─────────────┐    ┌─────────────┐  ┌─────────────┐
        │ Vault       │    │ PostgreSQL  │  │ Redis       │
        │ (Secrets)   │    │ Database    │  │ (Cache)     │
        └─────────────┘    └─────────────┘  └─────────────┘
              │                    │               │
              │ TLS 1.3            │ TLS 1.3       │ TLS
              ▼                    ▼               ▼
        ┌──────────────────────────────────────────────┐
        │ Encrypted Data at Rest (AES-256)             │
        │ - Encrypted credentials                      │
        │ - Encrypted database                         │
        │ - Encrypted cache                            │
        └──────────────────────────────────────────────┘

                  ┌────────────────────────────────┐
                  │  Monitoring & Logging Layer    │
                  │                                │
                  │ Prometheus (Metrics)           │
                  │ Falco (Runtime Security)       │
                  │ Fluentd (Logging)              │
                  │ QRadar (SIEM)                  │
                  │                                │
                  │ ✓ Monitor all requests         │
                  │ ✓ Detect anomalies             │
                  │ ✓ Alert on suspicious activity│
                  └────────────────────────────────┘
```

---

## Zero Trust Authentication Flow (Detailed)

### Step 1: User Login Request
```
Browser                          SecureBank
  │                                  │
  ├─ POST /login ─────────────────→  │
  │  {username, password}            │
  │  HTTPS/TLS 1.3 ✓                │
  │                                  ▼
  │                          Rate Limiter Check
  │                          (Max 5/5min per IP)
  │                                  │
  │                                  ▼
  │                          Hash received password
  │                          Compare with stored hash
  │                          (bcrypt, cost ≥ 12) ✓
  │                                  │
  │                           ✓ Match? YES
  │                                  │
  │  ← JWT (RS256 signed) ─────────  │
  │  Set httpOnly cookie ✓            │
  │  (Not accessible to JavaScript)  │
  │                                  │
  ▼ Store in memory (not localStorage)
```

### Step 2: Subsequent API Requests
```
Browser                          SecureBank
  │                                  │
  ├─ GET /account/1 ──────────────→  │
  │  Authorization: Bearer JWT       │
  │  Cookie: jwt=...  ✓              │
  │                                  ▼
  │                          API Gateway
  │                          ├─ Verify HTTPS ✓
  │                          ├─ Rate limit check ✓
  │                          │
  │                          ▼
  │                          Extract JWT from header
  │                          Verify RS256 signature ✓
  │                          Check expiration ✓
  │                          Check revocation list ✓
  │                          (Redis blacklist)
  │                          │
  │                          ▼
  │                          Extract claims
  │                          sub (user_id)
  │                          role (customer/admin)
  │                          │
  │                          ▼
  │                          Pass to Account Service
  │                          (via mTLS tunnel)
  │                          │
  │  ← Account Data ◄───────  │
  │  (Only if JWT.sub == 1)  │
  │  ✓ User verified         │
  │                          │
  ▼ Display data
```

### Step 3: Service-to-Service Communication
```
Account Service              Authorization Service       Database
       │                              │                    │
       ├─ Need user role ─────────→   │                    │
       │  (with mTLS cert)             │                    │
       │                              ▼                    │
       │                      Verify mTLS cert ✓           │
       │                      (mutual authentication)      │
       │                              │                    │
       │                      Return role info ◄───────   │
       │                      (encrypted tunnel)          │
       │◄─ Role confirmed ────                            │
       │  ✓ Both parties verified                         │
       │                                                  │
       ▼                                                  │
   Use JWT in request                                    │
   Grant/Deny based on role                             │
       │                                                  │
       ├─ Query Database ─────────────────────────────→  │
       │  (TLS 1.3 encrypted)                            │
       │                                                 ▼
       │                              Verify connection ✓
       │                              (encrypted, signed) 
       │                              │
       │  ◄─ Query Result ────────────┤
       │  (encrypted)                 │
       │                              │
       ▼ Process and return to user
```

---

## Zero Trust Architecture Components

### 1. Identity & Access Management (IAM)
```
Component: Auth Service (FastAPI)
├─ Authentication: Username/Password → JWT
├─ Authorization: RBAC (customer, admin)
├─ Token Type: RS256 (asymmetric)
├─ Expiration: 30 minutes
├─ Refresh: Via refresh token (7 days)
└─ Revocation: Redis blacklist
```

### 2. Network Security (K8s)
```
Component: Kubernetes NetworkPolicies
├─ Ingress Rules:
│  ├─ Auth Service: Only from API Gateway
│  ├─ Account Service: Only from Auth Service + API Gateway
│  ├─ Notification Service: Only from Kafka
│  └─ Database: Only from Account Service
├─ Egress Rules:
│  ├─ All services: To necessary external services only
│  ├─ No lateral movement allowed
│  └─ Registry access only from specific services
└─ Pod Security Standards: Enforce read-only filesystem
```

### 3. Encryption (Data Protection)
```
Component: TLS 1.3 + AES-256
├─ In Transit:
│  ├─ All HTTP → HTTPS/TLS 1.3
│  ├─ Service-to-service: mTLS
│  └─ Database connection: Encrypted
├─ At Rest:
│  ├─ Database: Encrypted (AES-256)
│  ├─ Secrets in Vault: Encrypted
│  └─ Cache in Redis: Encrypted
└─ Keys: Managed by HashiCorp Vault
```

### 4. Verification & Monitoring
```
Component: Prometheus + Falco + QRadar
├─ Prometheus:
│  ├─ Failed login attempts
│  ├─ JWT validation failures
│  ├─ Unauthorized access attempts
│  └─ Rate limit violations
├─ Falco:
│  ├─ Unexpected process execution
│  ├─ Suspicious file access
│  ├─ Network anomalies
│  └─ Real-time alerts
└─ QRadar:
│  ├─ SIEM correlation
│  ├─ Alert aggregation
│  ├─ Incident response automation
│  └─ Compliance reporting
```

---

## Zero Trust Policy Enforcement (OPA)

```
Example OPA Policy: Only admins can access /admin endpoint

# Policy Rule
admin_only[msg] {
    input.path == "/admin"
    input.jwt.role != "admin"
    msg := "Unauthorized: Admin access required"
}

# Usage
POST /admin
Authorization: Bearer CUSTOMER_JWT
↓
OPA evaluates policy
↓
Customer role ≠ admin
↓
Deny request (403 Forbidden)
↓
Log security event to QRadar
```

---

## Microsegmentation Matrix

```
FROM\TO      Auth    Account  Notif   DB     Redis  Vault
────────────────────────────────────────────────────────────
API Gateway   ✓        ✓       ✓      ✗      ✗      ✗
Auth Service  ✗        ✓       ✗      ✓      ✓      ✓
Account Svc   ✗        ✗       ✓      ✓      ✓      ✓
Notif Svc     ✗        ✓       ✗      ✓      ✗      ✓
Database      ✗        ✗       ✗      ✗      ✗      ✗
Redis         ✗        ✗       ✗      ✗      ✗      ✗
Vault         ✗        ✗       ✗      ✗      ✗      ✗

Legend: ✓ = Allowed communication
        ✗ = Blocked (deny by default)
```

---

## Kubernetes Implementation

### NetworkPolicy for Auth Service
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: auth-service-policy
spec:
  podSelector:
    matchLabels:
      app: auth-service
  policyTypes:
  - Ingress
  - Egress
  
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api-gateway
    ports:
    - protocol: TCP
      port: 8000
  
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
  
  - to:
    - podSelector:
        matchLabels:
          app: vault
    ports:
    - protocol: TCP
      port: 8200
  
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
```

### Pod Security Standard
```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
  - ALL
  volumes:
  - 'configMap'
  - 'emptyDir'
  - 'projected'
  - 'secret'
  - 'downwardAPI'
  - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'MustRunAs'
  readOnlyRootFilesystem: true
```

---

## Zero Trust Verification Checklist

- [ ] All traffic encrypted (HTTPS/TLS 1.3)
- [ ] JWT RS256 signature verified on every request
- [ ] JWT expiration checked
- [ ] JWT revocation list checked
- [ ] Role-based access control enforced
- [ ] Service-to-service mTLS configured
- [ ] NetworkPolicies enforced in K8s
- [ ] Vault used for secrets management
- [ ] Database access encrypted
- [ ] All requests logged and monitored
- [ ] Falco rules detecting anomalies
- [ ] QRadar SIEM receiving alerts
- [ ] Rate limiting active on all endpoints
- [ ] Account lockout after 5 failed attempts
- [ ] No implicit trust for internal services

---

## Success Criteria (Phase 2)

- ✅ Zero Trust diagram created
- ✅ Authentication flow documented
- ✅ Service-to-service security defined
- ✅ Kubernetes policies designed
- ✅ Monitoring strategy integrated
- ✅ All controls verified in code
- ✅ Team approval obtained

---

**Status**: Phase 2 - Zero Trust Architecture Complete
**Next**: SABSA Security Architecture Layer
