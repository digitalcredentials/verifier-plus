import { useVerificationContext } from "@/lib/verificationContext";
import styles from './VerifyIndicator.module.css';
import { TestId } from "@/lib/testIds";
import { ContextualHelp } from "../ContextualHelp/ContextualHelp";
import { verificationStatusHelpDescription, verificationStatusHelpSections } from "../Help";

export const VERIFYING_MSG = 'Verifying...';
export const NOT_VERIFIED_MSG = 'Not Verified'
export const WARNING_MSG = 'Warning';
export const VERIFIED_MSG = 'Verified'

export const VerifyIndicator = () => {
  const { loading, verificationResult } = useVerificationContext();
  let className: string = '';
  let icon: React.ReactElement | null = null;
  let text: string = '';

  const result = verificationResult?.results?.[0];
  const log = result?.log ?? [];

  // Normalize log into a lookup map
  const details = log.reduce<Record<string, boolean>>((acc, entry) => {
    acc[entry.id] = entry.valid;
    return acc;
  }, {});

  // Set default false for any missing expected keys
  ['valid_signature', 'expiration', 'registered_issuer'].forEach(key => {
    if (!(key in details)) {
      details[key] = false;
    }
  });

  // Define conditions
  const hasFailure = ['valid_signature', 'revocation_status'].some(
    key => details[key] === false
  );

  const hasWarning = ['expiration', 'registered_issuer'].some(
    key => details[key] === false
  );

  // Determine status
  if (loading) {
    className = styles.loading;
    text = VERIFYING_MSG;
  } else if (hasFailure) {
    icon = <span className={`material-icons ${styles.indicatorIcon}`}>cancel</span>;
    text = NOT_VERIFIED_MSG;
    className = styles.notVerified;
  } else if (hasWarning) {
    icon = <span className={`material-icons ${styles.indicatorIcon}`}>priority_high</span>;
    text = WARNING_MSG;
    className = styles.warning;
  } else {
    icon = <span className={`material-icons ${styles.indicatorIcon}`}>check_circle</span>;
    text = VERIFIED_MSG;
    className = styles.verified;
  }

  return (
    <div className={styles.container}>
      <span className={`${styles.indicator} ${className}`} >
        {icon}
        <span data-testid={TestId.VerifyIndicator}>{text}</span>
      </span>
       <ContextualHelp
                        description={verificationStatusHelpDescription} 
                        sections={verificationStatusHelpSections} 
                        title="VerificationIndicator"/>
    </div>
  );
};