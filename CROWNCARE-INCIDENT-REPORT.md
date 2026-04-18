# CrownCare Security Incident Report
**Date**: April 18, 2026

## Overview
A critical security exposure occurred when a Google Cloud API key (`AIza...`) from the `gen-lang-client-0598267713` project was committed and pushed to the CrownCare repository. Furthermore, an exhaustive audit revealed subsequent long-standing exposures of RevenueCat, Leonardo AI, and Meta Pages API credentials throughout the repository's tracked history. 

This report outlines the total remediation strategy executed to protect the infrastructure, sanitize the git history, and implement strict preventative measures.

## Phase A: Audit & Discovery
An exhaustive history scan via `git log -p` and `grep` was initiated against all branches. Discovered secrets included:
- **Google Cloud API/Firebase**: Discovered in older prototype files. The leaked user keys were rotated and successfully invalidated in Google Cloud Console, and client-side access was secured via HTTP referrer restrictions.
- **RevenueCat Platform Key**: Exposed directly in iOS initialization configuration.
- **Leonardo AI Key**: Exposed in legacy external AI generation test files.
- **Meta (Facebook) Graph API Tokens**: Two variations of long-lived access tokens were found in the backend Firebase function nodes (`/functions`).

## Phase B: Remediation
All secrets were forcibly removed from source code and replaced with `process.env` lookups.
1. `test_gemini.cjs`, `App.jsx`, and backend AI pipelines were migrated to rely purely on environment variables.
2. An extensive `.env.example` template was drafted to define system expectations.
3. Protected configuration dependencies, namely `.env*` formats, `google-services.json`, `*serviceAccount*.json`, and Apple mobile provisioning formats (`.p8`, `.p12`) were blacklisted in a revised `.gitignore`.
4. A comprehensive `SECURITY.md` file was drafted detailing zero-tolerance hardcoded secret protocols.

## Phase C: History Scrub
We utilized `git-filter-repo` to traverse all `59` historical commits and rewrite the commit objects, scrubbing the exact string values of the exposed keys using a `--replace-text` parameter mapping.
1. During the verification scrub, a secondary variant of the Meta Page token was flagged hiding in the branch histories.
2. A second filter pass successfully purged the hidden Meta token variant.
3. The resulting git tree was thoroughly analyzed regex matching against `AIza`, `appl_`, `sk_live_`, `sk-proj-`, and `EAAa`. **Zero matching records were detected.**
4. The remediated history was force-pushed to the remote (`main` and `publish-ios` branches).

## Phase D: Guardrails Infrastructure
To ensure this vulnerability is systemically eradicated going forward:
1. **gitleaks Pre-commit Hook**: Installed locally via `.pre-commit-config.yaml` to block any outgoing commit attempting to ship a tracked format credential.
2. **GitHub Actions pipeline**: A `secret-scan.yml` continuous integration workflow was built to run exhaustive secret scans exclusively on Pull Requests and direct pushes to production, blocking merges if an exposure evaluates true.
3. Both defense mechanisms were empirically tested using a dummy `AIza...` key; both lines of defense successfully caught and blocked the operation.

## Required Executive Actions (Pastor Mel)
The git history has been secured, but the previously accessed third-party systems must be locked down:
- [ ] **Rotate RevenueCat API Key**: The discovered key must be regenerated in the RevenueCat Dashboard.
- [ ] **Rotate Leonardo AI Key**: Generate a new API token immediately.
- [ ] **Rotate Meta Long-Lived Graph API Token**: Revoke the current `EAAa...` graph tokens and spawn new credentials for the backend Cron publisher.
- [ ] **Alert Team**: All contributors MUST delete their local CrownCare repositories and perform a fresh `git clone`. Standard `git pull` operations will irrevocably stall against the mismatched local/remote history and risk re-introducing the tainted history strings into the origin tree.

## Security Starter Expansion
The frameworks developed during this incident (such as the `.env.example`, `SECURITY.md`, and multi-tiered guardrails) have been formulated into a global **MLWhittle Security Starter** directory, alongside prompt instructions to deploy identical remediation audits against W.M.O.S., FuelFlow, Sandra, and Meluplace repositories.
