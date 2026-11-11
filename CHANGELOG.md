# verifier-plus Changelog

## 3.0.0
### Breaking
- `CREDENTIAL_STORE` and `EXCHANGES` are required. Docker users who set only `DB_USER`, `DB_PASS` and `DB_HOST` must add `CREDENTIAL_STORE=mongodb`, and `EXCHANGES=on` to keep requesting credentials from the Learner Credential Wallet (or `EXCHANGES=off`). See the README's "Upgrading from 2.x".
- `NEXT_PUBLIC_EXCHANGE_SERVER_URL` is replaced by `EXCHANGE_SERVER_URL`, which is optional and defaults to the address the browser used to reach the page. The old name is no longer read; the server logs a warning when it is set.
- A missing or invalid setting no longer crashes the server or a request. The server starts, routes that need the setting answer 503 naming it, and `/health/ready` reports it.
- Shared credentials expire one year after they are shared (`CREDENTIAL_TTL_DAYS`). Records stored by 2.x have no expiry date and are treated as expiring one year after they were created.
- The MongoDB store creates a unique index on `id` and a TTL index on `expiresAt`. A collection that already has a different index named `id_1` cannot share credentials until that index is removed; `/health/ready` names it.
- `npm test` runs the unit tests (Vitest). The Playwright tests moved to `npm run test:e2e`.
### Added
- Credential stores: `memory` (local development and tests), `mongodb` and `dynamodb`.
- `DB_URI`, a plain `mongodb://` or `mongodb+srv://` connection string, as an alternative to `DB_HOST`, `DB_USER` and `DB_PASS`.
- A 350 KB limit on a shared credential: larger ones get 413 "Credential too large to share".
- `/health/ready`: 200 when every setting is valid and the credential store answers, otherwise 503 naming what is wrong.
- `/api/config`: whether exchanges are on, and where wallets reach them. The landing page reads it.
- Limits that keep every request inside AWS Lambda's: a 20 second deadline on `/api/verify` and on `/api/proxy`'s fetch (504), a 5 MB limit on request bodies (413), and a 5 MB limit on documents `/api/proxy` fetches (502).
- `npm run build:lambda`, which builds `dist/lambda/` for AWS Lambda with the Lambda Web Adapter.
- `settings.contract.json`, every environment variable the app reads, checked against the code by a unit test.
- CI on every pull request: unit tests, the store tests against MongoDB and DynamoDB Local, the Lambda build with a smoke test, and the Docker image with MongoDB.
### Changed
- Node 24; Next 15.5.29.
- `GET /api/credentials/{id}` no longer returns MongoDB's `_id`.
- `EXCHANGES=on` is refused on AWS Lambda: exchanges are kept in process memory.
- The Playwright tests no longer compare screenshots; they check the verification icons and that images loaded.
### Fixed
- A credential that cannot be read (unknown, unshared or expired) returns 404 with an error body, instead of 500.
- `/api/verify` answers 400 to a body that is not JSON, instead of 500.
- The Docker image listens on every interface, so `/api/healthz` works inside the container.

## 2.0.2 
### Added
- Upgrade NextJS to 15.5.7

## 2.0.1 
### Added
- Add Alignments to Open Badges 3.0 Display
- VPR: Clarify to users on V+ site how to scan QR code
### Fixed
- A did_web_unresolved error should be better explained in the UI
- Drag and drop/ file browse isn't accessible
- Browser tab no longer showing Verifier Plus

## 2.0.0 
### Added
- Updates to NextJS 15 - consequential major code rework to use latest NextJS and React
- enables scanning a QR that points at a VC
- adds Playwright tests, both UI and API
- updates libs
- switches deprecated QR scanning lib to qr-scanner
- reworks docker build
### Fixed
- Hanging mongo connections

## 1.1.0 
### Added
- [EPIC] - Presentation request link: Send link; receive wallet creds and verify
- Add API endpoint to request/receive creds
- UI: adds link and QR code
- extract SERVER_URL to env
### Fixed
- Unhandled runtime error on exchange.ts

## 1.0.1 
### Added
- Update verifier core package
- Feature/url verification query params
### Fixed
- Fix problem where app crashes during verification of pasted JSON

## 1.0.0 
### Added
- [EPIC] Design for Issuer & Issuer Registry Display #168
- Source Data & Display of Issuer Name #50
- Identify and Remove Duplicate Validation Logic #170
- Content & Design for Error Messaging Based on Updates to Verifier Core #162
- Integrate verifier-core #155
- Updating Issuer & Issuer Registry Display #182
- Update to use latest issuer-registry-client #141
- Install and Configure verifier-core in Verifier Plus #171
- Update where we get credential name from #161
- Integrate verifier-core and shared known issuer registry list. #184

## 0.5.0 
### Added
- Update buttons wording on V+ #173
- Capability to Unbake Open Badge 3.0 #142
- Add favicon to verifierplus.org production deployment #80
- Change versioning on verifier plus site #119
- Revise 404 page: Credentials not found #121
- Update where we get credential name from in V+ #156