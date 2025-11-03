import styles from '../Help.module.css';
export const HolderHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>Typically the subject of the credential, e.g., a student who earned a diploma.</li>
      <li>Sometimes called the 'subject', 'earner', 'recipient', or the 'holder'.</li>
      <li>Set directly in the Verifiable Credential and cannot be changed without invalidating the cryptographic signature.</li>
    </ul>

    <p className={styles.note}><img src="./icons/info_24_lime.svg"></img>Note that 
    a credential might be 'issued to' someone other than the 'subject' of the credential. In this case we might say the 
    credential was issued to a 'holder'. An example could be a birth certificate for a child (the subject), but issued to the parent (the holder)
    who can then act on the child's behalf. However, because Verifiable Credentials are a relatively new technology, there
    isn't yet clear consensus on terminology, and the same term can often be used to describe different things, so it is 
    important to interpet context.
    </p>
    <p className={styles.note}><img src="./icons/info_24_lime.svg"></img>Note that some Verifiable Credentials might not 
    explicitly define a subject. Such credentials are sometimes called 'bearer credentials' meaning they belong to 
    whoever holds the credential. As such, when determining what to show for the 'issued to' field we try our best (as described below) 
    to determine the name of the credential subject, but default in the end to credential.name if no other value is found.
    </p>
    <p><h1 className={styles.title}>How we determine the value of this field</h1>
    In order of preference:
      <ul className={styles.list}>
      <li>credential.credentialSubject.name</li>
      <li>Scredential.credentialSubject.identifiers[identityType=name].identityHash</li>
      <li>credential.name</li>
    </ul>
    </p>

    
  </>
}