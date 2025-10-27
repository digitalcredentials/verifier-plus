import { useRef } from 'react';
import type { IssuerProps } from './Issuer.d';
import styles from './Issuer.module.css';
import { TestId } from '@/lib/testIds';
import { ContextualHelp } from '../ContextualHelp/ContextualHelp';

export const Issuer = ({ issuer, header, infoButtonPushed }: IssuerProps) => {
  const issuerImage = useRef<HTMLImageElement>(null);

  const HelpText = () => {
    return <>
      The issuer is the person or institution that issued the Verifiable Credential. 
      This might be, for example, a university that has granted a degree to a student
      and subsequently then issued a Verifiable Credential attesting that the student did earn the degree.
      <img
        src="/LightModeLogo.png"
        alt="DCC logo" />
    </>
  }

  const handleonError = () => {
    if (issuerImage.current != null) {
      issuerImage.current.style.visibility = 'hidden';
    }
  }

  return (
    <div>
      {(issuer?.image || issuer?.name || issuer?.url) && (
        <div>
          <h2 className={styles.header}>{header}<ContextualHelp title="What's an issuer?"><HelpText/></ContextualHelp></h2>
          <div className={styles.issuer}>
            {issuer.image && (
              <img src={issuer.image?.id || issuer.image} width={36} height={36} alt={`${issuer.name} logo`} ref={issuerImage} onError={handleonError} />
            )}
            <div className={styles.issuerInformation}>
              <div data-testid={TestId.IssuerName}>{issuer.name}
                {/* <span className={`material-icons-outlined ${styles.infoIcon}`} onClick={infoButtonPushed}>
                  info
                </span> */}
              </div>
              <p className={styles.issuerAddress}>{issuer.address}</p>
              <a href={issuer.url}>{issuer.url}</a>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
