# DriveNext | Digital driving licence portal

An independent, non-government demonstration relying party for MOSIP eSignet. No legal licence is issued and dates are preferences, not confirmed appointments.

## Features
- Responsive animated neon mobility artwork (local vector SVG, scalable without loss), accessible controls and reduced-motion support.
- The same official `@mosip/sign-in-with-esignet` package and `init` API as [MOSIP Health Services](https://github.com/mosip/esignet-mock-services/blob/master/mock-relying-party-ui/src/components/Login.js).
- OIDC discovery, authorization code, PKCE S256, optional PAR, server-side private_key_jwt, state, nonce, provider JWKS signature and subject checks.
- New licence, renewal, replacement and learner permit applications; persistent PostgreSQL storage and account-scoped tracker.
- No fake login or automatic licence approval. Signed-in users receive a pseudonymous account key based on issuer and subject.

## Local startup (Windows PowerShell)
Install Node 22 (22.13+), npm and Docker Desktop. Clone this repository, then:

```powershell
Copy-Item .env.example .env
New-Item -ItemType Directory -Force secrets
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the generated value into SESSION_SECRET in .env. Start the local DB and portal:
```powershell
docker compose up -d db
npm install
npm run build
npm test
npm start
```
Open http://localhost:8080. For the full container build use `docker compose up --build` instead (ensure the portal's DB is not already occupying another port). Keep the origin at localhost:8080 for the registered callback.

## MOSIP demo client onboarding
Discovery defaults to https://esignet.mosip-demo.mosip.net/.well-known/openid-configuration.
Register a **new** relying party with the demo environment operator. Provide an RSA public JWK, allowed scopes (openid profile), requested claims, client name DriveNext, and exact redirect URI `http://localhost:8080/api/auth/callback` if accepted for local testing. For hosted use, register the exact HTTPS URI instead. Never reuse the Health Services client or copy sample private keys.

Generate a key pair locally:
```powershell
node scripts/generate-key.js
```
Share only secrets/client-public.jwk with the operator. Put the registered client ID in ESIGNET_CLIENT_ID, keep secrets/client.jwk private, and restart. The signing JWK kid must match onboarding. Set ESIGNET_ACR and ESIGNET_USE_PAR as required by the target provider. Verify the published discovery issuer and token issuer; if intentionally different, configure ESIGNET_TOKEN_ISSUER with the confirmed issuer. The server fails closed if JWKS signature validation fails. Separate encrypted UserInfo key can be configured via ESIGNET_USERINFO_JWK_FILE; only supported signed nested JWTs are accepted.

The demo discovery endpoint must be reachable and the registration must allow a standard confidential code flow with PKCE; DPoP is not implemented. If mandatory in that environment, add DPoP before onboarding. Never disable token validation. Live login is not verified without an onboarded client and its key.

## Deployment and production checklist
This is a security-conscious demo baseline, not an audited production licensing system. Configure HTTPS APP_ORIGIN, exact redirect, mounted secrets and database TLS/credentials; set TRUST_PROXY=1 only behind one trusted proxy. Use externally managed database migrations, backups, monitoring, dependency scanning/lockfile, security testing, and explicit jurisdiction rules, officer approval, capacity scheduling and licence issuance integration before production. Local logout ends the portal session only. No OTP or national ID numbers are collected by this portal. Do not connect to or modify the MOSIP demo database.

## Project structure
- src/ — UI, animation, official eSignet button
- server/ — API, OIDC and validation
- public/ — vector artwork
- test/ — state, PKCE, validation and subject checks
- scripts/ — local key generation
- compose.yaml / Dockerfile — local deployment

## Vercel Hobby + Neon Free deployment
Import this Git repository with the Vite preset, root `./`, build `npm run build`, output `dist`. The API is a catch-all Node function; no Docker container is needed. Set production environment variables `DATABASE_URL` (Neon pooled TLS connection string), `SESSION_SECRET` (random 32+ characters), and `APP_ORIGIN` (exact production HTTPS origin). Configure `ESIGNET_CLIENT_ID` and `ESIGNET_PRIVATE_JWK` (private JWK JSON, sensitive environment variable) only after the relying party is registered. Optional `ESIGNET_USERINFO_JWK` holds a separate decryption key. The callback is `/api/auth/callback`. Do not expose database URLs or JWKs in Vite variables. Preview domains are not registered callback origins.
