const obv3 = `{
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
            "description": "This badge recognizes the development of the capacity to collaborate within a group environment."
        }
    },
    "id": "urn:uuid:677fe8a6cacf98774d482d06",
    "proof": {
        "type": "DataIntegrityProof",
        "created": "2025-09-26T17:41:27Z",
        "verificationMethod": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q#z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
        "cryptosuite": "eddsa-rdfc-2022",
        "proofPurpose": "assertionMethod",
        "proofValue": "z4J5pCVJAw7VqXkxVpUFZyGZXZmRgMTnHSz6jBp3qMQcrvuBRSud7kYkBaqyfLJViUG1BgLAi5JCc63RJbcnMMtRh"
    }
}`

export const getOBv3 = () => {
    return JSON.parse(obv3);
}