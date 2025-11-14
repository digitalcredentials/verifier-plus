import styles from '../Help.module.css';
export const LcwRequestHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>Demonstrates requesting a credential from an LCW Wallet.</li>
      <li>Uses the <a href="https://w3c-ccg.github.io/vp-request-spec/">Verifiable Presentation Request</a> specification.</li>
      <li>Primarily here to demonstrate how the request might work in other applications.</li>
    </ul>

    <div className={styles.note}><img className={styles.infoIcon}  src="./icons/info_24_lime.svg"></img>We've included this feature in VerifierPlus as a working demonstration
    of how an application might request credentials from a wallet like the Learner Credential Wallet. In this demonstration, 
    once VerifierPlus has gotten the credential, it verifies it, but other applications might request a credential for other reasons, for example, to 
    obtain structured and verified data, say when applying for a job.
    </div>

     <div className={styles.criteria}><div className={styles.title}>How the request works</div>
        <div className={styles.preference}>The steps in the exchange, loosely:</div>
      <ol className={styles.list}>
      <li>Click the 'Request credentials from LCW +' button in V+</li>
      <li>The V+ UI generates a uuid for a new exchange and encodes it into a deeplink that is shown to the user (as a QR), like this one (UUID shortened for readability):
        <pre>
{`dccrequest://request?request={"credentialRequestOrigin":`}<br/>
{`"https://verifierplus.org","protocols":{"vcapi":`}<br/>
{`"https://verifierplus.org/api/exchanges/80c8e5f0-93b9a9"}}`}
    </pre>  
    </li>
    <li>The important bit in there is the exchanges endpoint, i.e, the value of the 'vcapi' property:
https://verifierplus.org/api/exchanges/80c8e5f0-93b9a9</li>
<li>The V+ UI now starts polling that exchange endpoint until the GET returns a result. The endpoint won't return a result until the LCW has posted a credential.</li>
    <li>User opens the deeplink on their phone (by scanning QR with phone camera)</li>
    <li>The LCW posts an empty object to the exchanges endpoint.</li>
    <li>The V+ server API receives the post and returns a verifiablePresentationRequest like so:
<pre>{`{
    "verifiablePresentationRequest": {
      "query": [
        {
          "type": "QueryByExample",
          "credentialQuery": {
            "reason": "Please present your 
            Verifiable Credential to complete 
            the verification process.",
            "example": {
              "type": ["VerifiableCredential"]
            }
          }
        }
      ]
    }
  }
    `}
  </pre></li>
  <li>The LCW receives that request and posts whatever credentials the user selects to the same exchanges endpoint.</li>
    <li>The V+ exchanges endpoint receives the posted credentials and stores them.</li>
    <li>Now the next time the V+ UI polls the exchanges endpoint, it will get back the credentials.</li>
    <li>Finally, the LCW verifies the credentials.</li>
    </ol>
    </div>

  </>
}
