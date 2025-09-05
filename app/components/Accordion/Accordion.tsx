import React, { useEffect, useState } from 'react';
import type { AccordionProps } from './Accordion.d';
import styles from './Accordion.module.css';

export const Accordion = ({iconClosed, iconOpen, title, onOpen, onClose, children}: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // Used to set timers, start and stop polling, etc.
  useEffect(() => {
    if (isOpen) {
      onOpen && onOpen()
    } else {
      onClose && onClose()
    }
    // Cleanup
    return () => onClose && onClose();
  }, [isOpen]);

  return (
    <div className={`${styles.floatingTextarea}`}>

      <button className={`${styles.button}`} onClick={toggleOpen}>
      {isOpen ? <span>{iconOpen}</span> : <span>{iconClosed}</span>} {title} {isOpen ? ' - ' : ' + '}
      </button>
      {isOpen && <div className={`${styles.floatingTextarea}`}>{children}</div>}
    </div>
  );
}
