# SecureBank - Threat Model (STRIDE)

## Auth Service Data Flow Threat Analysis

### STRIDE Categories
- **S** - Spoofing: False identity claims
- **T** - Tampering: Unauthorized modification
- **R** - Repudiation: Deny actions
- **I** - Information Disclosure: Unauthorized access
- **D** - Denial of Service: System unavailability
- **E** - Elevation of Privilege: Unauthorized admin access

## Key Threats (from MITRE ATT&CK)

1. T1110 - Brute Force on /login
   - Mitigation: Rate limiting, account lockout

2. T1190 - SQL Injection
   - Mitigation: Parameterized queries (ORM)

3. T1059 - XSS in transfer notes
   - Mitigation: DOMPurify, CSP headers

4. T1078 - Privilege Escalation
   - Mitigation: JWT signature verification, OPA policies

5. T1212 - Broken Object Authorization
   - Mitigation: JWT.sub validation middleware

---

**Status**: Phase 1 - Threat Model Template
