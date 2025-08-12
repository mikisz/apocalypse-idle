# Component Usage Guidelines

Components should use the project's design tokens and Tailwind utilities to remain consistent and accessible.

- **Use tokens**: Prefer utilities like `bg-background`, `text-foreground`, or `stroke-muted-foreground` instead of hard-coded values.
- **Avoid custom CSS**: Replace bespoke rules and hex colors with the available tokens or utilities. Inline styles should only express dynamic values.
- **Accessibility**: Provide ARIA roles and labels and ensure all interactive elements are keyboard navigable with sufficient color contrast.
- **Semantics**: Favor semantic HTML and keep layouts and spacing driven by utilities.

Following these practices keeps the interface cohesive and easier to maintain.
