import type {ToggleSwitchProps} from './ToggleSwitch.d'
import styles from './ToggleSwitch.module.css';

export const ToggleSwitch = ({ icon, isOn, handleToggle }: ToggleSwitchProps) => {
  return(
    <div>
      <div className={styles.container}>
        
        <label
          aria-label='Dark mode'
          htmlFor='toggle'
          className={styles.switch}
        >
          {icon}
          <input
            checked={isOn}
            id='toggle'
            type="checkbox"
            onChange={handleToggle}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  )

}