import type { InfoBlockProps } from './InfoBlock.d';
import styles from './InfoBlock.module.css';

export const InfoBlock = ({header, contents}: InfoBlockProps) => {
  return (
    <div className={styles.infoBlock}>
      <h2 className={styles.smallHeader}>{header}</h2>
      <div className={styles.contents}>{contents}</div>
    </div>
  );
}