import type { ComponentProps } from 'react';
import { Button as ShadcnButton } from './ui/button';

export type ButtonProps = ComponentProps<typeof ShadcnButton>;

export function Button(props: ButtonProps) {
  return <ShadcnButton {...props} />;
}

export default Button;
