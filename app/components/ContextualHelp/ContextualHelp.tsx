import * as React from 'react';
import type { CollapsibleSectionProps, ContextualHelpProps } from './ContextualHelp.d';
import HelpIcon from '@mui/icons-material/HelpOutlined';
import { Dialog } from '@base-ui-components/react/dialog';
import { ScrollArea } from '@base-ui-components/react/scroll-area';
import { Collapsible } from '@base-ui-components/react/collapsible';
import { useHelpContext } from '@/lib/HelpContext';

function ChevronIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...props}>
      <path d="M3.5 9L7.5 5L3.5 1" stroke="currentcolor" />
    </svg>
  );
}

const CollapsibleSection = ({ sectionTitle, content }: CollapsibleSectionProps) => {
   return (
   <Collapsible.Root className="flex flex-col justify-center text-gray-900">
      <Collapsible.Trigger className="group flex items-center gap-2 rounded-sm bg-gray-100 px-2 py-1 text-sm font-medium hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800 active:bg-gray-200">
        <ChevronIcon className="size-3 transition-all ease-out group-data-[panel-open]:rotate-90" />
        {sectionTitle}
      </Collapsible.Trigger>
      <Collapsible.Panel className="flex h-[var(--collapsible-panel-height)] flex-col justify-end overflow-hidden text-sm transition-all ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
        <div className="mt-1 flex cursor-text flex-col gap-2 rounded-sm bg-gray-100 py-2 pl-7">
          {content}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>)
}
export const ContextualHelp = ({ title, iconSize = '12px', children, sections, iconColor = 'info', style = "align-top mx-1 inline m-h-1" }: ContextualHelpProps) => {
  let {isHelpEnabled} = useHelpContext();
  if (isHelpEnabled) {
    return (
      <Dialog.Root>
        <Dialog.Trigger onClick={(e) => e.stopPropagation()} nativeButton={false} render={<span className={`${style} hover:cursor-pointer`}><HelpIcon sx={{ fontSize: iconSize }} htmlColor={iconColor} /></span>}>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 min-h-dvh bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-200 max-w-[calc(100vw)] md:max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-2 md:p-6 text-gray-900 outline outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
            <Dialog.Title className="-mt-1.5 mb-1 text-lg text-center md:text-left font-medium">{title}</Dialog.Title>

            <ScrollArea.Root className="w-full">
              <ScrollArea.Viewport className="max-h-[75dvh] overscroll-contain rounded-md outline -outline-offset-1 outline-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800">
                <div className="flex flex-col gap-4 py-5 pr-1 pl-1 md:pr-5 md:pl-5 text-sm leading-[1.375rem] text-gray-900">
                  {children}
                  {
                    sections && sections.map((section : CollapsibleSectionProps) => (
                      <CollapsibleSection key={crypto.randomUUID()} content={section.content} sectionTitle={section.sectionTitle} />
                    ))
                  }
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar className="m-2 flex w-1 justify-center rounded bg-gray-200 opacity-0 transition-opacity delay-300 pointer-events-none data-[hovering]:opacity-100 data-[hovering]:delay-0 data-[hovering]:duration-75 data-[hovering]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:delay-0 data-[scrolling]:duration-75 data-[scrolling]:pointer-events-auto">
                <ScrollArea.Thumb className="w-full rounded bg-gray-500" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>

            <div className="flex justify-end gap-4 mt-5">
              <Dialog.Close className="flex h-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3.5 text-base font-medium text-gray-900 select-none hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-100">
                Close
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    );
  } else {
    return null
  }
}






