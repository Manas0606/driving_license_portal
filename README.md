# DriveNext | Digital driving licence portal

An independent, non-government demonstration relying party for MOSIP eSignet. No legal licence is issued and dates are preferences, not confirmed appointments.

## Features
- Responsive animated neon mobility artwork (local vector SVG, scalable without loss), accessible controls and reduced-motion support.
- The same official `@mosip/sign-in-with-esignet` package and `init` API as [MOSIP Health Services](https://github.com/mosip/esignet-mock-services/blob/master/mock-relying-party-ui/src/components/Login.js).
- OIDC discovery, authorization code, PKCE S256, optional PAR, server-side private_key_jwt, state, nonce, provider JWKS signature and subject checks.
- New licence, renewal, replacement and learner permit applications; temporary application tracker (maximum five demo requests per sign-in, cleared at logout or expiry). No database required.
- No fake login or automatic licence approval. The RP retrieves and validates identity through eSignet and follows the Health Services reference pattern using browser sessionStorage for transient state, PKCE and the demo profile; tokens and signing keys are never sent to the browser.

## Local startup (Windows PowerShell)
Install Node 22 (22.13+), npm (Docker Desktop is optional). Clone this repository, then:

```powershell
Copy-Item .env.example .env
New-Item -ItemType Directory -Force secrets
```

Configure the relying-party credentials in .env. Start the portal:
```powershell
npm install
npm run build
npm test
npm start
```
Open http://localhost:8080. For the full container build use `docker compose up --build` instead. Keep the origin at localhost:8080 for the registered callback.

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
This is a security-conscious demo baseline, not an audited production licensing system. Configure HTTPS APP_ORIGIN, exact redirect, mounted or environment secrets; set TRUST_PROXY=1 only behind one trusted proxy. Before production, add durable application storage, server-side session revocation/replay protection, distributed rate limiting, monitoring, dependency scanning/lockfile, security testing, jurisdiction rules and official licence issuance. The UI is a mock relying party: browser-held demo records are not authoritative and must not authorize any protected service. Local logout clears sessionStorage and does not end the provider session. No OTP or national ID numbers are collected by this portal. Do not connect to or modify the MOSIP demo database.

## Project structure
- src/ — UI, animation, official eSignet button
- server/ — API, OIDC and validation
- public/ — vector artwork
- test/ — state, PKCE, validation and subject checks
- scripts/ — local key generation
- compose.yaml / Dockerfile — local deployment

## Vercel Hobby deployment (no database)
Import this Git repository with the Vite preset, root `./`, build `npm run build`, output `dist`. The API is a catch-all Node function; no Docker container is needed. Set production environment variables `APP_ORIGIN` (exact production HTTPS origin). Configure `ESIGNET_CLIENT_ID` and `ESIGNET_PRIVATE_JWK` (private JWK JSON, sensitive environment variable) only after the relying party is registered. Optional `ESIGNET_USERINFO_JWK` holds a separate decryption key. The callback is `/api/auth/callback`. Do not expose private JWKs in Vite variables. No SESSION_SECRET or database is needed. The landing page works without authentication configuration; actual login requires relying-party onboarding. Preview domains are not registered callback origins.

Authentication follows the Health Services reference flow: the UI creates cryptographically random state, nonce and PKCE verifier, keeps them in sessionStorage, and invokes the official button. The registered callback redirects to the UI, which checks and consumes state, then calls POST /api/fetchUserInfo. The backend performs private_key_jwt token exchange, validates ID token signatures and UserInfo subject, and returns only the profile. Demo requests are local browser data, not real applications. All three ACRs are configured by default; the provider must support them. Optional PAR remains available; DPoP is not implemented.
