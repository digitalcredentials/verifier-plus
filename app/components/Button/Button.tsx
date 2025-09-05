import type { ButtonProps } from './Button.d';
import styles from './Button.module.css';
export const Button = ({secondary = false, onClick = () => {}, text, icon = null, className = ''}: ButtonProps) => {
  return (
    <button className={`${styles.button} ${secondary ? styles.secondaryButton : ''} ${className}`} onClick={onClick}>
      {icon} {text}
    </button>
  )
}