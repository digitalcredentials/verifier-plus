'use client'
import Link from 'next/link';
import type { BottomBarProps } from './BottomBar.d'
import styles from './BottomBar.module.css'

export const BottomBar = ({isDark}: BottomBarProps) => {
  return(
    <footer className={styles.container}>
      <div className={styles.logoContainer}>
        <a href='https://digitalcredentials.mit.edu/'>
          <img
            src={isDark ? '/DarkModeLogo.png' : '/LightModeLogo.png'}
            alt='Digital Credentials Consortium logo'
            className={styles.logo}
          />
        </a>
      </div>
      <div className={styles.linkContainer}>
        <Link href='/terms' className={styles.link}>Terms and Conditions of Use</Link>
        <Link href='/privacy' className={styles.link}>Privacy Policy</Link>
        <Link className={styles.link} href='https://accessibility.mit.edu/'>Accessibility</Link>
        <Link className={styles.link} href='https://github.com/digitalcredentials/verifier-plus'>View on Github</Link>
      </div>
    </footer>
  )
}
