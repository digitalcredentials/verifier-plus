import type { TopBarProps } from "./TopBar.d"
import { ToggleSwitch } from "components/ToggleSwitch/ToggleSwitch";
import Link from "next/link";
import { useCallback, useEffect } from "react"
import styles from './TopBar.module.css'

export const TopBar = ({hasLogo = false, isDark, setIsDark, setCredential}: TopBarProps) => {

  const enableDarkMode = useCallback(() => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkMode', 'true');
    setIsDark(true);
  },[setIsDark]);

  // get local storage value for darkmode on mount
  useEffect(() => {
    let darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') { setIsDark(true); enableDarkMode(); }
    else { setIsDark(false); }
  },[setIsDark, enableDarkMode]);


  const disableDarkMode = () => {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkMode', 'false');
    setIsDark(false)
  }

  const handleToggle = () => {
    if (isDark) {
      disableDarkMode();
    }
    else {
      enableDarkMode();
    }
  }

  const clearCredential = () => {
    if (setCredential) {
      setCredential(undefined);
    }
  }

  return(
      <header className={`${hasLogo ? styles.hasLogoContainer : styles.container}`}>
        { hasLogo ? 
          <div className={styles.logo} onClick={() => clearCredential()}>
            <Link href='/'>
              <div>
                <p>VerifierPlus</p>
              </div>
              {/* <p>VerifierPlus</p> */}
            </Link>
          </div>
         : null
        }
        <ToggleSwitch
          isOn={isDark}
          handleToggle={handleToggle}
          icon={ <span aria-hidden className={`material-icons ${styles.darkmodeIcon}`}> dark_mode </span> }
        />
        {/* <button className={styles.loginButton} type='button'>
          <span aria-hidden className={`material-icons ${styles.loginIcon}`}> login </span>
          Login
        </button>*/}
        
      </header>
  )
}