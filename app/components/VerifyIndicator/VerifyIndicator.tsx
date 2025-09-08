import { useVerificationContext } from "@/lib/verificationContext";
import styles from './VerifyIndicator.module.css';

export const VerifyIndicator = () => {
  const { loading, verificationResult } = useVerificationContext();
  let className: string = '';
  let icon: JSX.Element | null = null;
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
    text = 'Verifying...';
  } else if (hasFailure) {
    icon = <span className={`material-icons ${styles.indicatorIcon}`}>cancel</span>;
    text = 'Not Verified';
    className = styles.notVerified;
  } else if (hasWarning) {
    icon = <span className={`material-icons ${styles.indicatorIcon}`}>priority_high</span>;
    text = 'Warning';
    className = styles.warning;
  } else {
    icon = <span className={`material-icons ${styles.indicatorIcon}`}>check_circle</span>;
    text = 'Verified';
    className = styles.verified;
  }

  return (
    <div className={styles.container}>
      <span className={`${styles.indicator} ${className}`}>
        {icon}
        {text}
      </span>
    </div>
  );
};