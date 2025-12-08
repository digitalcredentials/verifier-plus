import styles from '../Help.module.css';

const DeterminationSection = () => {
  return (
      <ul className={styles.list}>
      <li><span className={styles.emphasis}>Verifying</span> if verification is still in progress.</li>
      <li><span className={styles.emphasis}>Verified</span> if nothing has been tampered with, the credential hasn't expired, hasn't been revoked, and is from a known issuer.</li>
      <li><span className={styles.emphasis}>Not Verified</span> if the credential has been tampered with, the signature can't been checked, or the credential has been revoked.</li>
      <li><span className={styles.emphasis}>Warning</span> if the credential hasn't been tampered with, but has expired, or isn't from a known issuer.</li>
    </ul>
)
}

const DetailsSection = () => {
  return (
    <ul className={styles.list}>
       Four possible statuses: <span className={styles.emphasis}>Verified</span>, <span className={styles.emphasis}>Not Verified</span> , <span className={styles.emphasis}>Warning</span> or <span className={styles.emphasis}>Verifying</span>
    </ul>
  )
}

const NotesSection = () => {
  return (
    <>  
<div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>We only flag a credential as <span className={styles.emphasis}>Not Verified</span> is if:
<br/><br/>
<ul className={styles.list}>
   <li>the credential has been tampered with</li>
   <li>we can't otherwise verify the signature</li>
   <li>the credential has been revoked </li>
   </ul><br/>
   <div>If, however, the credential
    has expired or is from an issuer we don't recognize we take a moderate approach
    and simply show a <span className={styles.emphasis}>Warning</span>. </div>
    <br/>
    <div>We are less strict because our verification page is primarily for education and 
    demonstration. A verification page for a university that verifies degrees would likely more strictly enforce 
    expiry, and would most certainly reject credentials from an unknown issuer.</div>
    </div>
    </>
  )
}

const DescriptionSection = () => {
  return (
    <div className={styles.note}>An indication of the status of the credential.</div>
  )
}

export const verificationStatusHelpDescription = DescriptionSection()

export const verificationStatusHelpSections  = [
  { sectionTitle: 'Details', content: DetailsSection() },
  { sectionTitle: 'How We Determine the Status', content: DeterminationSection() },
  { sectionTitle: 'Notes', content: NotesSection( )}
]
