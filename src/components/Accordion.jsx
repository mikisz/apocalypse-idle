import React, { useState } from 'react';

export default function Accordion({
  title,
  children,
  defaultOpen = false,
  action,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stroke">
      <div className="flex items-center justify-between p-2">
        <button
          className="flex-1 flex items-center justify-between"
          onClick={() => setOpen(!open)}
        >
          <span>{title}</span>
          <span>{open ? '-' : '+'}</span>
        </button>
        {action && <div className="ml-2">{action}</div>}
      </div>
      {open && <div className="p-2 space-y-2">{children}</div>}
    </div>
  );
}
