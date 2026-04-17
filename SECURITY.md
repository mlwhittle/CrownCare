# Security Policy

## Incident Reporting
On April 17, 2026, multiple secrets (including Google Cloud, Firebase, RevenueCat, Leonardo, and Meta API keys) were discovered exposed in the commit history. All exposed keys were immediately rotated, restricted, and permanently expunged from the repository history using `git-filter-repo`.

## Zero-Tolerance Policy for Secrets
No secrets are to be committed to this repository under any circumstances.
- All secrets MUST be injected via environment variables.
- Use `.env` files for local development. Ensure `.env` and `.env.local` files remain in `.gitignore`.
- This repository uses `gitleaks` as a pre-commit hook to prevent accidental secret exposures.
- Pull Requests will be automatically scanned by GitHub Actions using `gitleaks`. Any PR containing secrets will be blocked.
