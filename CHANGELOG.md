# verifier-plus Changelog

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