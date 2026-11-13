import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  function toggle(id: string) {
    setOpenIds((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  }

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => {
        const open = openIds.includes(item.id);
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={open}
                aria-controls={`accordion-panel-${item.id}`}
                id={`accordion-button-${item.id}`}
                className="flex w-full items-start justify-between gap-6 py-4 text-left transition-colors hover:text-royal"
              >
                <span className="text-[0.9375rem] font-semibold leading-6 text-ink">{item.question}</span>
                <ChevronDown
                  className={cn('mt-1 h-4 w-4 shrink-0 text-slate transition-transform', open && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>
            </h3>
            {open && (
              <div
                id={`accordion-panel-${item.id}`}
                role="region"
                aria-labelledby={`accordion-button-${item.id}`}
                className="animate-fade-in pb-5 pr-10 text-sm leading-7 text-slate"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
