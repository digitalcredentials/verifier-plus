import type {ToggleSwitchProps} from './ToggleSwitch.d'
import styles from './ToggleSwitch.module.css';

export const ToggleSwitch = ({ icon, isOn, handleToggle, name, ariaLabel }: ToggleSwitchProps) => {
  return(
    <div>
      <div className={styles.container}>
        
        <label
          aria-label={ariaLabel} 
          htmlFor={name}
          className={styles.switch}
        >
          {icon}
          <input
            checked={isOn}
            id={name}
            type="checkbox"
            onChange={handleToggle}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  )

}