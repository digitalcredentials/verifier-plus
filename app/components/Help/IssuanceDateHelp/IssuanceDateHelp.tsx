import styles from '../Help.module.css';
export const IssuanceDateHelp = () => {
 return <>
    <ul className={styles.list}>
      <li>The date the Verifiable Credential became valid.</li>
      <li>The issuance date is set directly in the Verifiable Credential and cannot be changed without invalidating the cryptographic signature.</li>
      <li>For Version 1 Verifiable Credentials we use the <b>issuanceDate</b> property<br/>e.g., <b>"issuanceDate": "2025-01-09T16:23:24Z"</b></li>
      <li>For Version 2 Verifiable Credentials we use the <b>validFrom</b> property<br/>e.g., <b>"validFrom": "2025-01-09T16:23:24Z"</b></li>    
    </ul>

    <p className={styles.note}><img src="./icons/info_24_lime.svg"></img>Note that the issuance date is not necessarily
    the date that the Verifiable Credential was signed, although in most cases they will be the same. The issuance date can in 
    fact pre-date the VC or be in a date after the VC was signed. So it might be better to think of the issuance date as 
    the date at which the Verifiable Credential becomes valid, which could have been in the past or future.
    </p>
        <p className={styles.note}><img src="./icons/info_24_lime.svg"></img>Note that the issuance date is not 
        the date when the underlying credential (like a degree) was awarded. In that case, when using OBv3, the better 
        field to use is awardedDate.
    </p>
  </>
}