# DriveNext | Digital driving licence portal

A demonstration relying party for the MOSIP demo environment. No official driving licence or appointment is issued.

## Reference architecture

The repository follows the IIITB Health Services relying-party layout (branch `sa-id-0.10.1`):
- `mock-relying-party-service/app.js`: Express HTTP API and local static hosting.
- `mock-relying-party-service/config.js`: backend environment configuration.
- `mock-relying-party-service/esignetService.js`: private_key_jwt, token exchange and UserInfo.
- `mock-relying-party-ui/src/`: DriveNext UI, official sign-in SDK and browser session.
- `mock-relying-party-ui/public/locales/default.json` and per-language JSON: runtime language settings.
- `mock-relying-party-ui/public/profile-config.json`: requested and displayed claims.

The frontend uses React, react-i18next, i18next HTTP locale loading and Axios following Health Services. DriveNext screens retain their driving licence design and business logic. The existing Vite build and npm-hosted official SDK are retained for the working Node 22 setup. The source is adapted from the Health Services integration pattern, not a byte-for-byte copy of its mock code. The root npm commands build the UI and serve both logical components on one Express origin for local testing. The backend uses Axios and JOSE with Health Services method names, encoded public claims configuration and support for compact, flattened and general JWE. It uses the same token and UserInfo endpoints and `POST /fetchUserInfo` pattern as Health Services, retaining PKCE, state, ID token signature, issuer, nonce and subject checks. The existing registered claims (name, optional email) and authentication methods are kept to avoid changing the live client policy. The callback remains `/api/auth/callback` for the existing registration. Private credentials never reach the frontend. The demo uses no database.

## Local startup (Windows CMD)

Connect the authorized MOSIP WireGuard VPN. Use Node 22.13+ and Git. Register the exact callback `http://localhost:8080/api/auth/callback` if not already registered.

For a new checkout, copy `.env.example` to `.env` and save your registered private JWK to `secrets/client.jwk`. Set the existing client ID and key file in `.env`. Existing local checkouts can retain their current `.env` and secrets folder; old VITE_ variables are no longer used. The backend provides public client metadata at `/env-config.js` using the Health Services `window._env_` convention. Never place signing or encryption keys in the public directory.

```cmd
npm install
npm run check
npm test
npm run build
npm start
```

Open http://localhost:8080. Connectivity diagnostics: http://localhost:8080/api/health?probe=1. Optional Docker: `docker compose up --build` (container networking must also reach the identity provider).

## Change claims without changing JavaScript

Edit `mock-relying-party-ui/public/profile-config.json`. Add an entry such as `{"claim":"nationality","label":"Nationality","essential":false}`. `request:false` means only display if returned via scope; `aliases` lists alternative response keys; `type` may be text, address or picture. Claims are requested and returned/displayed from this configuration, not an unrestricted dump of the UserInfo payload. Protocol fields and tokens are excluded. For security and privacy, add only approved claims required by the application. Existing default photo and demographic fields are retained.

Update the eSignet client registration, scopes, partner policy and provider mappings where required, then sign out and start a fresh login. The provider must return the claim with user consent. Configuration files are served directly at runtime, so editing profile-config.json needs no JavaScript rebuild. Refresh the page to reload public settings. Backend endpoint, client and scope changes in .env require a backend restart.

## Add a language

Edit `mock-relying-party-ui/public/locales/default.json` and create a matching JSON file, e.g. `fr.json`. The translation keys are the English labels found in en.json. Missing translations fall back to English. Add the language to rtlLanguages when appropriate. Refresh the page; no JavaScript rebuild is required. The selected code is passed as ui_locales to eSignet; claims_locales remains en, matching the Health Services login configuration. The provider must separately support the UI language. Existing six languages keep their current translations; some detailed labels fall back to English.

## Security and deployment

The app is a mock RP, not an audited production system. Local logout clears browser sessionStorage; it does not terminate the provider session. Only explicitly configured, consented profile data is retained for the demo. Network access to the private demo environment must be authorized. Use HTTPS and a trusted gateway in a shared deployment. Keep keys private and rotate previously exposed keys.

## Coral Grand Tour cinematic theme

The UI uses a warm coral, champagne and rose palette with a local vector canyon scene, an animated driver/car sequence, wheel and exhaust effects, floating licence artwork, and an ignition gauge. Pause control and reduced-motion preferences are respected. No extra service or dependency is required. If a local `mock-relying-party-ui/public/cinematic/coral-grand-tour.mp4` exists, the hero plays the optional silent cinematic montage; otherwise the vector scene remains available. The video is optional and is not required for build or sign-in. The existing authentication and business logic are unchanged.
