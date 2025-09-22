const testVP = `{"vp":{
        "holder": "did:key:blahblahblah",
        "type": ["VerifiablePresentation", "ExamplePresentation"],
        "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://www.w3.org/ns/credentials/examples/v2"
  ],
  "id": "urn:uuid:3978344f-8596-4c3a-a978-8fcaba3903c5",
        "verifiableCredential": {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.2.json",
                "https://w3id.org/security/suites/ed25519-2020/v1"
            ],
            "id": "urn:uuid:951b475e-b795-43bc-ba8f-a2d01efd2eb1",
            "type": [
                "VerifiableCredential",
                "OpenBadgeCredential"
            ],
            "issuer": {
                "id": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
                "type": "Profile",
                "name": "University of Wonderful",
                "description": "The most wonderful university",
                "url": "https://wonderful.edu/",
                "image": {
                    "id": "https://user-images.githubusercontent.com/947005/133544904-29d6139d-2e7b-4fe2-b6e9-7d1022bb6a45.png",
                    "type": "Image"
                }
            },
            "issuanceDate": "2020-01-01T00:00:00Z",
            "name": "A Simply Wonderful Course",
            "credentialSubject": {
                "type": "AchievementSubject",
                "achievement": {
                    "id": "http://wonderful.wonderful",
                    "type": "Achievement",
                    "criteria": {
                        "narrative": "Completion of the Wonderful Course - well done you!"
                    },
                    "description": "Wonderful.",
                    "name": "Introduction to Wonderfullness"
                }
            },
            "proof": {
                "type": "Ed25519Signature2020",
                "created": "2024-06-19T16:56:38Z",
                "verificationMethod": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q#z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
                "proofPurpose": "assertionMethod",
                "proofValue": "z2iy74s1XcmYzszzAy3oFdUwPXaF5h24Ym2vLaQ3NAaNQcC6z63sQasmgBCZcC6Y1gH5QSAky2GxfYvuG7DfMS6iT"
            }
        }}}`

export const getTestVP = ()=>{
    return JSON.parse(testVP)
}

export const getSampleVCAsString = () => {
    return testVP
}

export const getTestVPForVPQR = () => {
    const testVP = getTestVP().vp
    testVP.verifiableCredential = [testVP.verifiableCredential]
    return {verifiablePresentation: testVP}
}