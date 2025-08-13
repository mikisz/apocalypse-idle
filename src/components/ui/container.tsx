import * as React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps<T extends React.ElementType = 'div'> {
  as?: T;
  className?: string;
}

type Props<T extends React.ElementType> = ContainerProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof ContainerProps>;

export function Container<T extends React.ElementType = 'div'>({
  as,
  className,
  ...props
}: Props<T>) {
  const Component = as ?? 'div';
  return (
    <Component
      className={cn(
        'rounded-xl border border-border bg-card p-4 shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export default Container;
