# Security Audit Skill

## Overview
Security-focused analysis for the React frontend. Identifies client-side vulnerabilities, insecure data handling, and exposure risks.

## Audit Checklist

### XSS Prevention
- [ ] No use of `dangerouslySetInnerHTML` without sanitization
- [ ] User input escaped before rendering
- [ ] URL parameters validated before use
- [ ] No `eval()` or `new Function()` with user data

### Authentication Security
- [ ] Tokens stored securely (httpOnly cookies preferred over localStorage)
- [ ] Token expiration handled with proper refresh flow
- [ ] Auth state cleared completely on logout
- [ ] Protected routes redirect unauthenticated users
- [ ] No tokens or credentials in URL parameters

### API Security
- [ ] API base URL configured via environment variable
- [ ] HTTPS enforced for all API calls
- [ ] Authorization header sent with every authenticated request
- [ ] Error responses don't expose internal details to users
- [ ] Request/response interceptors handle 401 consistently

### Data Exposure
- [ ] No sensitive data in `console.log` statements
- [ ] No credentials or API keys in source code
- [ ] `.env` files in `.gitignore`
- [ ] Source maps disabled in production build
- [ ] LocalStorage/SessionStorage doesn't contain PII

### Dependency Security
- [ ] Run `npm audit` — no critical vulnerabilities
- [ ] Dependencies from trusted sources only
- [ ] Lock file (`package-lock.json`) committed
- [ ] No known vulnerable package versions

### Content Security
- [ ] External resources loaded over HTTPS
- [ ] Third-party scripts from trusted CDNs only
- [ ] No inline scripts or styles (CSP compatible)
- [ ] Image sources validated

## Severity Levels
- 🔴 **Critical**: XSS, token exposure, auth bypass
- 🟠 **High**: Insecure storage, missing auth checks
- 🟡 **Medium**: Missing CSP, debug artifacts
- 🟢 **Low**: Best practice improvements
