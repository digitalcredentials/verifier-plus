import styles from '../Help.module.css';
export const RegistryListHelp = () => {
  return <>
  <ul className={styles.list}>
        <li>A list of all the registries in which the DID used to sign the credential is registered.</li>
        <li>For each registry we provide the issuer name and url registered for that DID.</li>
        <li>The DCC makes no claims about the legality of credentials signed by issuers who are registered in its registries - only that we know about the issuer.</li>  
        <li>We look up the issuer's DID dynamically so it can happen that one or more of the registries might be unreachable.</li> 
        <li>If we can't find the DID (that signed the credential) in any registry then we show a warning</li>
        <li>In a production environment, if a DID can't be found in a registry it would be untrustworthy, unless we happen to know the DID is trustworthy for some other reason.</li>

  </ul>
  
      <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
      It is fundamentally necessary that we are told in some 
      trustworthy way that a public key does belong to the issuer. Otherwise
        fake key pairs could be used to sign fake credentials. 
        An issuer can tell us directly which keys are theirs, which can be as a simple as 
        saying, "Hey there, my DID is did:key:z6MkjoriXdbyWD25YXTed114F8hdJrLXQ567xxPHAUKxpKkS" 
        or they might post it on their known
    web site (e.g. mit.edu) so we can check it as needed, or they can add it to a registry 
    so that it can be looked up along with the 
    keys of other issuers.
      </div>
      <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
      We look up public keys in a registry controlled by the Digital Credentials Consortium.
        We don't, however, make any guarantees about the trustworthiness or legitimacy of the credentials - only that they
        were signed by a key that has been registered in one of our registries. We make no guarantees because our registries are 
        strictly for demonstration purposes. 
        </div>
        <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
        A 'real' verifier would use a registry whose registered issuers had been vetted and approved to issue specific credentials. 
       A registry of keys controlled by the association of university registrars for a given coountry, for example,
            could be used to verify digital degrees from accredited universities. In this case, it might then be more accurate
            to say it was a registry of 'trusted' issuers, rather than simply 'known' issuers.</div>

  </>
}