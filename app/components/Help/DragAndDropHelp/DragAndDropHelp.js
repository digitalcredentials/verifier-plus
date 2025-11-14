import styles from '../Help.module.css';
export const DragAndDropHelp = () => {
  return <>
  <ul className={styles.list}>
        <li>This is where you provide the Verifiable Credential you'd like to verify, as a file.</li>
        <li>You can either choose the file from your computer using 'Browse', or find the file on your computer and drag it into this dotted box.</li>    
         <li>JSON (Javascript Object Notation) is a simple way to structure data in a parent/child hierachy.</li>  
          <li>You can alternatively directly paste the text from the file into the area just above labelled 'Paste JSON or URL'.</li>   
  </ul>
  
     <div className={styles.note}><img className={styles.infoIcon} src="./icons/info_24_lime.svg"></img>
      For an example of what the JSON for a Verifiable Credential looks like, see the help text for the 'Paste JSON or URL' 
      text area just above.
    
      You can also download the file from this URL to your computer and try dragging it or selecting it:
      <div className={styles.scrollableLink}>
        <a href="https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/dataIntegrityProof/didKey/legacyRegistry-noStatus-noExpiry-basicOBv3.json"><div className={styles.scrollableLink}>https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/dataIntegrityProof/didKey/legacyRegistry-noStatus-noExpiry-basicOBv3.json</div></a>
      </div>
      </div>
  </>
}