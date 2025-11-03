export const RegistryHelp = () => {
  return <>
    <p>To know who issued a <a href="https://w3c.github.io/vc-data-model/">Verifiable Credential</a> we must 
    know who controls the cryptographic key pair (a public key and a private key) used to sign the credential, which typically means
    we must be told from a trustworthy source that the public key does in fact belong
    to the claimed issuer. We can be told directly by the issuer themselves, which can be as a simple as saying, "Hey there, my DID is did:key:z6MkjoriXdbyWD25YXTed114F8hdJrLXQ567xxPHAUKxpKkS" or they might post it on their known
    web site (e.g. mit.edu) so we can check it as needed, or they might add it to a registry so that it can be looked up along with the 
    keys of other issuers.
      </p>
      <p>It is fundamentally necessary that we are told in some trustworthy way that a public key does belong to the issuer. Without that knowledge,
        fake key pairs could be used to sign fake credentials and we just wouldn't know.
      </p>
      <p>In this app, when verifying a credential, we look up public keys in a registry controlled by the Digital Credentials Consortium.
        We don't, however, make any guarantees about the trustworthiness or legitimacy of the credentials - only that they
        were signed by a key that has been registered in one of our registries. We make no guarantees because this is 
        strictly for demonstration purposes. A 'real' verifier would use a registry whose entries have been vetted and approved. 
        </p>
        <p>A registry of keys controlled by the association of university registrars for a given coountry, for example,
            could be used to verify digital degrees from accredited universities </p>
             <p>A slight nuance is that Verifiable Credentials are typically signed with a Decentralized Identifier which
              is simply a more durable way to describe a signing key. So we look up DIDs in our registry. </p>
  </>
}