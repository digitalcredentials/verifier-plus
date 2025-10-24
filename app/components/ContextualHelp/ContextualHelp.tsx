import type { ContextualHelpProps } from './ContextualHelp.d';
import {useFloating} from '@floating-ui/react';

export const ContextualHelp = ({text}: ContextualHelpProps) => {
  const {refs, floatingStyles} = useFloating();
  return (
    <>
      <button ref={refs.setReference}>Help!</button>
      <div ref={refs.setFloating} style={floatingStyles}>
        {text}
      </div>
    </>
  );
}