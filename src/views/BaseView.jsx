import { useState } from 'react'
import { useGame } from '../state/useGame.js'
import EventLog from '../components/EventLog.jsx'

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-stroke">
      <button
        className="w-full flex items-center justify-between p-2"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span>{open ? '-' : '+'}</span>
      </button>
      {open && <div className="p-2 space-y-2">{children}</div>}
    </div>
  )
}

export default function BaseView() {
  const { state } = useGame()

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="border border-stroke rounded">
        <AccordionItem title="Food" defaultOpen>
          <button
            disabled
            className="w-full text-left p-2 rounded border border-stroke bg-bg2 opacity-50"
          >
            Berry Bush
          </button>
          <button
            disabled
            className="w-full text-left p-2 rounded border border-stroke bg-bg2 opacity-50"
          >
            Fishing Hut
          </button>
        </AccordionItem>
        <AccordionItem title="Storage">
          <p className="text-sm text-muted">Coming soon</p>
        </AccordionItem>
        <AccordionItem title="Industry">
          <p className="text-sm text-muted">Coming soon</p>
        </AccordionItem>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Event Log</h2>
        <EventLog log={state.log} />
      </div>
    </div>
  )
}

