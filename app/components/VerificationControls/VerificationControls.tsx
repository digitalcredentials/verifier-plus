import { DateTime } from 'luxon';
import type { VerificationControlsProps } from './VerificationControls.d';
import styles from './VerificationControls.module.css';
import { ResultLog } from '@/components/ResultLog/ResultLog';
import { VerifyResponse } from '@/types/credential';

export const VerificationControls = ({ verificationResult, verifyCredential }: VerificationControlsProps ) => {
  //const { verified } = verificationResult;
  const hasFatalError = verificationResult?.results?.[0]?.error?.isFatal;
  
  return (
    <div>
      
      <div className={styles.result}>
      <div className={styles.title}> Credential Verification and Validation</div>
      {!hasFatalError && <div className={styles.subTitle}> This credential:</div>}
        {/* <span className={`material-icons ${verified ? styles.verified : styles.notVerified}`}>
          {verified ? 'check_circle' : 'cancel'}
        </span> */}
        <div className={styles.messageContainer}>
          {/* <div>
            {verified ? 'Credential Verified' : 'Credential Not Verified'}
          </div> */}
        <ResultLog verificationResult={verificationResult as VerifyResponse} />
        <div className={styles.lastChecked}>Last Checked: {DateTime.now().toLocaleString(DateTime.DATE_MED)}</div>
        </div>
      </div>
      
      <button className={styles.verifyButton} type="button" onClick={verifyCredential}>
        <span className="material-icons">sync</span>
        Run Verification
      </button>
    </div>
  );
};