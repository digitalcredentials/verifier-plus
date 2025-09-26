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

const obv3_v1 = `{
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
        "https://w3id.org/security/data-integrity/v2"
    ],
    "id": "urn:uuid:2fe53dc9-b2ec-4939-9b2c-0d00f6663b6c",
    "issuanceDate": "2025-01-09T15:06:31Z",
    "expirationDate": "2090-01-09T16:23:24Z",
    "type": [
        "VerifiableCredential",
        "AchievementCredential"
    ],
    "name": "DCC Test Credential",
    "issuer": {
        "type": [
            "Profile"
        ],
        "id": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
        "name": "Digital Credentials Consortium Test Issuer",
        "url": "https://dcconsortium.org",
        "image": {
            "id": "https://digitalcredentials.github.io/badge-assets/dcc.png",
            "type": "Image"
        }
    },
    "credentialSubject": {
        "type": [
            "AchievementSubject"
        ],
        "achievement": {
            "id": "urn:uuid:bd6d9316-f7ae-4073-a1e5-2f7f5bd22922",
            "type": [
                "Achievement"
            ],
            "achievementType": "Diploma",
            "name": "Badge",
            "description": "This is a sample credential issued by the Digital Credentials Consortium to demonstrate the functionality of Verifiable Credentials for wallets and verifiers.",
            "criteria": {
                "type": "Criteria",
                "narrative": "This credential was issued to a student that demonstrated proficiency in the Python programming language that occurred from February 17, 2023 to June 12, 2023."
            },
            "image": {
                "id": "https://digitalcredentials.github.io/badge-assets/DCC_Delft_Summit_Presenter.png",
                "type": "Image"
            }
        },
        "identifier": [
            {
                "type": "IdentityObject",
                "identityHash": "Taylor Tuna",
                "identityType": "name",
                "hashed": false,
                "salt": "not-used"
            }
        ]
    },
    "proof": {
        "type": "DataIntegrityProof",
        "created": "2025-09-26T19:51:25Z",
        "verificationMethod": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q#z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
        "cryptosuite": "eddsa-rdfc-2022",
        "proofPurpose": "assertionMethod",
        "proofValue": "z5DawfsUZsKJiTr6ea34VJFwJj9PXuHEdNxqp91N6dDkXqL2iTkLhBtifFjUrhCa65GF9ZmzcbjV6dW2k2MAgrZnZ"
    }
}`

export const getOBv3_v2 = () => {
    return JSON.parse(obv3_v2);
}

export const getOBv3_v1 = () => {
    return JSON.parse(obv3_v1)
}