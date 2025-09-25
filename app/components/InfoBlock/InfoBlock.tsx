import type { InfoBlockProps } from './InfoBlock.d';
import styles from './InfoBlock.module.css';

export const InfoBlock = ({header, contents, testId}: InfoBlockProps) => {
  // The testId allows playwright to more reliably find this element on the page
  return (
    <div className={styles.infoBlock}>
      <h2 className={styles.smallHeader}>{header}</h2>
      <div className={styles.contents} data-testid={testId}>{contents}</div>
    </div>
  );
}