import type { InfoBlockProps } from './InfoBlock.d';
import styles from './InfoBlock.module.css';

import { ContextualHelp } from '@/components/ContextualHelp/ContextualHelp'

export const InfoBlock = ({header, contents, testId, helpTitle, HelpContent}: InfoBlockProps) => {
  // The testId allows playwright to more reliably find this element on the page
  return (
    <div className={styles.infoBlock}>
      <h2 className={styles.smallHeader}>{header}{HelpContent&&<ContextualHelp title={helpTitle}><HelpContent/></ContextualHelp>}</h2>
      <div className={styles.contents} data-testid={testId}>{contents}</div>
    </div>
  );
}