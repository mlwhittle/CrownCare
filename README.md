# CrownCare

CrownCare is a premium Clinical Luxury platform for women's hair health.

## Security Notice

The Firebase `apiKey` located in `src/firebase.js` is considered public by design for web client bundles. **However, it MUST be restricted in the Google Cloud Console** to only accept HTTP referrers matching your production hosting domains (e.g., `https://*.web.app`, `https://*.firebaseapp.com`).

**DO NOT** commit any other `.env` files, Service Account JSONs, or private API keys to this repository. All secrets must be injected at build time.
