# Test SSL Configuration

Verify SSL/TLS configuration for the React frontend:

1. **HTTPS Enforcement**: Check that production builds enforce HTTPS
2. **Mixed Content**: Scan for HTTP resources loaded on HTTPS pages
3. **API URL**: Verify `VITE_API_URL` uses `https://` in production
4. **CSP Headers**: Check Content-Security-Policy for HTTPS-only directives
5. **Cookie Flags**: Ensure auth cookies have `Secure` and `SameSite` attributes

## Steps
- Check `.env` and `.env.production` for protocol settings
- Grep source files for hardcoded `http://` URLs
- Review Vite config for HTTPS dev server settings
- Verify service worker (if any) uses secure origins
- Report findings with pass/fail for each criterion
