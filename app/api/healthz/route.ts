import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { CredentialErrorTypes } from 'types/credential';
/**
 * GET /api/healthz
 * @param req
 * @param res
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            let allChecksPass = true;
            let error;
            const protocol = req.headers["x-forwarded-proto"] === 'https' ? 'https' : 'http'
            const host = req.headers.host;
            const baseURL = `${protocol}://${host}/`
            const credentialsURL = `${baseURL}api/credentials`

            /* WRAP EACH CALL IN A TRY CATCH SO AS TO CATCH THE INDIVIDUAL ERRORS 
            AND THEREBY RETURN A MORE MEANINGFUL ERROR. */
            // check landing page

            try {
                await axios.get(baseURL)
                error = `OK: Landing page is returning properly.`
            } catch (e) {
                allChecksPass = false
                error = `ERROR: Landing page is not returning properly.`
            }

            let addCredResponse
            try {
                addCredResponse = await axios.post(credentialsURL, vp)
                error = `${error} \n OK: Successfully added a test credential.`
            } catch (e) {
                allChecksPass = false
                error = `${error} \n ERROR: Couldn't add a test credential. Your mongo connection may be down. If using Mongo Atlas, be sure that you've added the IP of your VerifierPlus server to your Mongo account's whitelist. The axios error: ${e}`
            }

            /*
            If we were able to add a credential, we can now confirm that we 
            can fetch it, view it, and delete it.
            */
            if (addCredResponse?.data?.url) {
                // uploading the credential returns a list of urls for getting, viewing, and deleting the credential:
                const urls = addCredResponse.data.url;

                // confirm can get credential from api
              
                try {
                    await axios.get(`${baseURL}${urls.get}`)
                    error = `${error} \n OK: Successfully retrieved the test credential.`
                } catch (e) {
                    allChecksPass = false
                    error = `${error} \n ERROR: Couldn't get the test credential, error: ${e}`
                }

                // confirm can view credential on web page
               
                try {
                    await axios.get(`${baseURL}${urls.view}`)
                    error = `${error} \n OK: Successfully viewed the test credential.`
                } catch (e) {
                    allChecksPass = false
                    error = `${error} \n ERROR: Couldn't view the test credential, error: ${e}`
                }

                let apiDeleteReponse
                try {
                    apiDeleteReponse = await axios.delete(`${baseURL}${urls.unshare}`)
                    error = `${error} \n OK: Successfully deleted the test credential.`
                } catch (e) {
                    allChecksPass = false
                    error = `${error} \n ERROR: Couldn't delete the test credential, error: ${e}`
                }
            }

            if (allChecksPass) {
                console.log("server status ok")
                res.status(200).json({ message: 'verifier-plus server status: ok.', healthy: true });
            } else {
                res.status(503).json({ error, healthy: false })
            }
        } else {
            res.status(400).json({ status: 'Invalid Request' })
        }
    } catch (e) {
        console.log(`exception in healthz: ${JSON.stringify(e)}`)
        res.status(503).json({
            error: `verifier-plus healthz check failed with error: ${e}`,
            healthy: false
        })
    }
}

const vp = {
    vp: {
        holder: 'does not matter what is here, just that it is here, at least for now',
        verifiableCredential: {
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
        }
    }
}