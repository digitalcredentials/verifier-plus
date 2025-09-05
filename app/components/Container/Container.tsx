import styles from './Container.module.css';
import type { ContainerProps } from './Container.d';

export const Container = ({ children }: ContainerProps) => {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
}