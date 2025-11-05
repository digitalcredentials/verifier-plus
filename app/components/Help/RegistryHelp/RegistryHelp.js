import styles from '../Help.module.css';
export const RegistryHelp = () => {
  return <>
  <ul className={styles.list}>
        <li>Verifies that we recognize the key that signed the credential.</li>
        <li>VerifierPlus looks up the key in the DCC registries.</li>    
         <li>The DCC makes no claims about the authenticity or relevance of credentials signed by keys in its registries - only that we know about the keys in some way.</li>   
  </ul>
  
      <p className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
      It is fundamentally necessary that we are told in some 
      trustworthy way that a public key does belong to the issuer. Otherwise
        fake key pairs could be used to sign fake credentials. 
        An issuer can tell us directly which keys are theirs, which can be as a simple as 
        saying, "Hey there, my DID is did:key:z6MkjoriXdbyWD25YXTed114F8hdJrLXQ567xxPHAUKxpKkS" 
        or they might post it on their known
    web site (e.g. mit.edu) so we can check it as needed, or they might add it to a registry 
    so that it can be looked up along with the 
    keys of other issuers.
      </p>
      <p className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
      We look up public keys in a registry controlled by the Digital Credentials Consortium.
        We don't, however, make any guarantees about the trustworthiness or legitimacy of the credentials - only that they
        were signed by a key that has been registered in one of our registries. We make no guarantees because our registries are 
        strictly for demonstration purposes. 
        </p>
        <p className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
        A 'real' verifier would use a registry whose registered issuers had been vetted and approved to issue specific credentials. 
       A registry of keys controlled by the association of university registrars for a given coountry, for example,
            could be used to verify digital degrees from accredited universities. In this case, it might then be more accurate
            to say it was a registry of 'trusted' issuers, rather than simply 'known' issuers.</p>

             <p className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>A slight nuance is that Verifiable Credentials are typically signed with a Decentralized Identifier which
              is simply a more durable way to describe a signing key. So we look up DIDs in our registry. </p>
  </>
}