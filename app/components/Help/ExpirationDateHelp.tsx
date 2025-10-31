export const ExpirationDateHelp = () => {
  return <>
    <p>There are a few key points here:
      <ul>
        <li>The credential is considered 'expired' after the given date.</li>
        <li>The expiry date is set directly in the Verifiable Credential.</li>
      </ul>
      </p>
    <p></p>
    <p>Version 1 Verifiable Credentials set the date like so:</p>
    <pre>"expirationDate": "2025-01-09T16:23:24Z"</pre>
    <p>For version 2 Verifiable Credentials, the date is set like so:</p>
    <pre>"validUntil": "2025-01-09T16:23:24Z"</pre>

    <p>One nuance, though, is that sometimes a credential is still useful even though it has expired. An expired driver's licence, for
      example, can still be used to prove our age. Or to prove that we were in fact authorized to drive during a given period, 
      which might be useful when applying for a job that requires some number of years of driving experience.
    </p>
  </>
}