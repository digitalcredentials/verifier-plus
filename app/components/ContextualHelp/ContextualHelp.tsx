import type { ContextualHelpProps } from './ContextualHelp.d';
import {useFloating, useClick, useInteractions} from '@floating-ui/react';
import { useState } from 'react';
import HelpIcon from '@mui/icons-material/HelpOutlined';
import styles from './ContextualHelp.module.css';

export const ContextualHelp = ({text}: ContextualHelpProps) => {

  const [isOpen, setIsOpen] = useState(false);
 
  const {refs, floatingStyles, context} = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });
 
  const click = useClick(context);
 
  const {getReferenceProps, getFloatingProps} = useInteractions([
    click,
  ]);
 
  return (
    <>
      <span className={styles.icon} ref={refs.setReference} {...getReferenceProps()}>
       <HelpIcon fontSize='inherit' color='info'/>
      </span>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          {text}
        </div>
      )}
    </>
  );

}