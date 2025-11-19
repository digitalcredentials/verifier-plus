import * as React from 'react';
import type { CollapsibleSectionProps, JsonViewProps, VcDisplayProps, JSONLinkProps, VerifierPlusLinkProps } from './VcDisplay.d';
import ReactJsonView from '@microlink/react-json-view'
import { useMediaQuery } from 'react-responsive'
import { Collapsible } from '@base-ui-components/react/collapsible';
import styles from './VcDisplay.module.css'
import { useEffect, useState } from 'react';

const jsonSample = {
    "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
        "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    "id": "http://example.com/credentials/3527",
    "type": [
        "VerifiableCredential",
        "OpenBadgeCredential"
    ],
    "issuer": {
        "id": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
        "type": [
            "Profile"
        ],
        "name": "Example Corp"
    },
    "validFrom": "2010-01-01T00:00:00Z",
    "validUntil": "2011-01-01T00:00:00Z",
    "name": "Teamwork Badge",
    "credentialSubject": {
        "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
        "type": [
            "AchievementSubject"
        ],
        "achievement": {
            "id": "https://example.com/achievements/21st-century-skills/teamwork",
            "type": [
                "Achievement"
            ],
            "criteria": {
                "narrative": "Team members are nominated for this badge by their peers and recognized upon review by Example Corp management."
            },
            "description": "This badge recognizes the development of the capacity to collaborate within a group environment.",
            "name": "Teamwork"
        }
    },
    "proof": {
        "type": "Ed25519Signature2020",
        "created": "2025-01-07T22:14:25Z",
        "verificationMethod": "did:key:z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q#z6MknNQD1WHLGGraFi6zcbGevuAgkVfdyCdtZnQTGWVVvR5Q",
        "proofPurpose": "assertionMethod",
        "proofValue": "z2B4R2hwrcgR8ag39SZEgm2hAJSPnoWae7zdRr8RUTkcbMPNHu7tedk1x3D29J3CmiU5Wb1e7zew82nQAKYCQuRBo"
    }}

function ChevronIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...props}>
      <path d="M3.5 9L7.5 5L3.5 1" stroke="currentcolor" />
    </svg>
  );
}

const JSONLink = ({ link }: JSONLinkProps) => {

  return (<div>
    <div >Link to the JSON:</div>
    <div className={styles.scrollableLink}>
      <a href={link}><div className={styles.scrollableLink}>{link}</div></a>
    </div>
  </div>)
}

const VerifierPlusLink = ({ link }: VerifierPlusLinkProps) => {

  return (<div>
    <div>
      <a target="_blank" style={{ color: "black", fontWeight: 800, textDecoration: 'underline' }} href={`https://verifierplus.org#verify?vc=${link}`}>Open</a> the credential directly in VerifierPlus.
    </div>
  </div>)
}

const JsonView = ({ link }: JsonViewProps) => {

  const isMobile = useMediaQuery({ query: '(max-width: 1279px)' })

  const [json, setJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(link);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let result = await response.json();
        setJson(result);
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [link]);

  if (loading) return <div>Loading the credential...</div>;
  if (error) return <div>Sorry, we couldn't load the credential, but here is where it should be: </div>;

  

  return (<div>
    {json &&
      <>
        <div style={{ paddingBottom: '1em' }}>Click the arrows to expand nodes, and ellipses to expand text.</div>
        <ReactJsonView
          src={json}
          collapseStringsAfterLength={isMobile ? 10 : 40}
          enableClipboard={false}
          displayDataTypes={false}
          displayArrayKey={false}
          displayObjectSize={false}
          name='credential'
          collapsed={isMobile ? 1 : false}
        />
      </>
    }
  </div>)
}

const CollapsibleSection = ({ sectionTitle, content }: CollapsibleSectionProps) => {
  return (
    <Collapsible.Root className="flex flex-col justify-center text-gray-900">
      <Collapsible.Trigger className="group flex items-center gap-2 rounded-sm bg-gray-100 px-2 py-1 text-sm font-medium hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-200">
        <ChevronIcon className="size-3 transition-all ease-out group-data-[panel-open]:rotate-90" />
        {sectionTitle}
      </Collapsible.Trigger>
      <Collapsible.Panel className="flex h-[var(--collapsible-panel-height)] flex-col justify-end overflow-hidden text-sm transition-all ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
        <div className="mt-1 flex cursor-text flex-col gap-2 rounded-sm bg-gray-100 py-2 pl-7">
          {content}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>)
}


export const VcDisplay = ({ title, link }: VcDisplayProps) => {
  return (
    <div>
      {title && <div style={{ paddingBottom: '1em' }}>{title}</div>}
      <CollapsibleSection sectionTitle='JSON View' content={JsonView({ link })} />
      <CollapsibleSection sectionTitle='JSON Link' content={JSONLink({ link })} />
      <CollapsibleSection sectionTitle='VerifierPlus Link' content={VerifierPlusLink({ link })} />
    </div>
  )
}