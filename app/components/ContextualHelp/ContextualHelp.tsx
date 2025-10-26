import type { ContextualHelpProps } from './ContextualHelp.d';
import {useFloating, useClick, useInteractions} from '@floating-ui/react';
import { useState } from 'react';
import HelpIcon from '@mui/icons-material/HelpOutlined';

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
      <div ref={refs.setReference} {...getReferenceProps()}>
       <HelpIcon/>
       
      </div>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          Floating element
        </div>
      )}
    </>
  );

}