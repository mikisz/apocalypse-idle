import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionItem, AccordionContent } from './ui/accordion';

export default function GameAccordion({
  title,
  children,
  defaultOpen = false,
  action,
  contentClassName,
  noBottomBorder,
}) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? 'item' : undefined}
    >
      <AccordionItem value="item" className={cn(noBottomBorder && 'last:border-b-0')}>
        <AccordionPrimitive.Header className="flex items-center bg-card">
          <AccordionPrimitive.Trigger
            className={cn(
              'flex flex-1 items-center justify-between px-4 py-4 font-medium transition-all hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180',
            )}
          >
            <span>{title}</span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </AccordionPrimitive.Trigger>
          {action && <div className="ml-2">{action}</div>}
        </AccordionPrimitive.Header>
        <AccordionContent>
          <div className={cn('p-2 space-y-2', contentClassName)}>
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
