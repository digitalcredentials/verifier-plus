export const IssuerHelp = () => {
  return <>
    <p>The issuer is the person or institution that issued the Verifiable Credential, for example, a university that gives students Verifiable Credentials confirming their graduation.</p>
    <p>Fundmentally important is that to trust anything signed by an issuer,
      the DID (Decentralized Identififer) used to
      sign the credential must be known to us in some way. That might be because
      we keep a list of DIDs in our verifier that we know about, or it might that we look up
      the DID in some kind of registry that we in turn trust. Both are effectively lists
      of DIDs that we trust. If a credential has not been signed by a DID that we know about
      then we cannot trust the credential - it could have been faked and signed by anyone.
    </p>
  </>
}