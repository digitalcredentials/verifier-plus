import * as React from 'react';
import type { CollapsibleSectionProps, JsonViewProps, VcDisplayProps, JSONLinkProps, VerifierPlusLinkProps } from './VcDisplay.d';

// tell nextjs not to load react-json-view on the server because
// react-json-view needs access to the document object, which
// doesn't yet exist with ssr
import dynamic from 'next/dynamic';
const ReactJsonView = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

import { useMediaQuery } from 'react-responsive'
import { Collapsible } from '@base-ui-components/react/collapsible';
import styles from './VcDisplay.module.css'
import { useEffect, useState } from 'react';
import { CopyToClipboard } from '../CopyToClipboard/CopyToClipboard';

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
                <CopyToClipboard buttonText={"Copy Link To Clipboard"} text={link} />
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

const JsonView = ({ link, nodesToExpand = [] }: JsonViewProps) => {

  const isMobile = useMediaQuery({ query: '(max-width: 1279px)' })

  const [json, setJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const shouldCollapse =
    ({ namespace }: any) => {
      //  we add 'false' to the list of nodes to expand (i.e, the 'concat('false')), because 'false' is the root name when
      // a root name isn't to be shown in the display
      return nodesToExpand.map(node => `${'false.'}${node}`).concat('false').includes(namespace.join('.')) ? false : true
    }

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
  if (error) return <div>{`Sorry, we couldn't load the credential, but here is where it should be: ${link}`}</div>;



  return (<>
    {json &&
      <div>
        <div style={{ paddingBottom: '1em'}}><CopyToClipboard  buttonText={"Copy VC To Clipboard"} text={JSON.stringify(json,null,2)} /></div>
        <div style={{ paddingBottom: '1em' }}>Click the arrows to expand nodes, and ellipses to expand text.</div>
        <ReactJsonView
          src={json}
          collapseStringsAfterLength={isMobile ? 10 : 40}
          enableClipboard={false}
          displayDataTypes={false}
          displayArrayKey={false}
          displayObjectSize={false}
          name={false}
          shouldCollapse={shouldCollapse}
        />
      </div>
    }
  </>)
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


export const VcDisplay = ({ title, link, nodesToExpand }: VcDisplayProps) => {
  return (
    <div>
      {title && <div style={{ paddingBottom: '1em' }}>{title}</div>}
      <CollapsibleSection sectionTitle='JSON View' content={JsonView({ link, nodesToExpand })} />
      <CollapsibleSection sectionTitle='JSON Link' content={JSONLink({ link })} />
      <CollapsibleSection sectionTitle='VerifierPlus Link' content={VerifierPlusLink({ link })} />
    </div>
  )
}