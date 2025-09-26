const obv3_v2 = `{
    "type": [
        "VerifiableCredential",
        "OpenBadgeCredential"
    ],
    "name": "Teamwork Badge",
    "issuer": {
        "type": [
            "Profile"
        ],
        "name": "Example Corp",
        "id": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q"
    },
    "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "validFrom": "2010-01-01T00:00:00Z",
    "validUntil": "2030-01-02T00:00:00Z",
    "credentialSubject": {
        "type": [
            "AchievementSubject"
        ],
        "name": "Sam Salmon",
        "achievement": {
            "id": "https://example.com/achievements/21st-century-skills/teamwork",
            "type": [
                "Achievement"
            ],
            "achievementType": "A big bad badge",
            "name": "Bachelors - v2 - Test",
            "criteria": {
                "narrative": "Team members are nominated for this badge by their peers and recognized upon review by Example Corp management."
            },
            "description": "This badge recognizes the development of the capacity to collaborate within a group environment.",
            "image": {
                "id": "https://digitalcredentials.github.io/badge-assets/DCC_Delft_Summit_Presenter.png",
                "type": "Image"
            }
        }
    },
    "id": "urn:uuid:677fe8a6cacf98774d482d06",
    "proof": {
        "type": "DataIntegrityProof",
        "created": "2025-09-26T19:12:26Z",
        "verificationMethod": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q#z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
        "cryptosuite": "eddsa-rdfc-2022",
        "proofPurpose": "assertionMethod",
        "proofValue": "z2p7cy2HS4Sv5whEwubM2tgcq5GDN9keGPR5kMNAFfad57guJdf5zsF5a77BkaMVduQgdzFPiLN8TmpLYc51bw1ks"
    }
}`

const obv3_v1 = ``

export const getOBv3_v2 = () => {
    return JSON.parse(obv3_v2);
}

export const getOBv3_v1 = () => {
    return JSON.parse(obv3_v1)
}