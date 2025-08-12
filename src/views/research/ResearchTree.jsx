import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RESEARCH, RESEARCH_MAP } from '../../data/research.js';
import ResearchNode from './ResearchNode.jsx';
import { useGame } from '../../state/useGame.ts';
import { RESOURCES } from '../../data/resources.js';

const RESEARCH_ROWS = RESEARCH.reduce((acc, r) => {
  acc[r.row] = acc[r.row] || [];
  acc[r.row].push(r);
  return acc;
}, []);

function evaluate(node, state) {
  const completed = state.research.completed || [];
  if (completed.includes(node.id)) return { status: 'completed', reasons: {} };
  if (state.research.current?.id === node.id)
    return { status: 'inProgress', reasons: {} };
  const missingPrereqs = (node.prereqs || [])
    .filter((p) => !completed.includes(p))
    .map((id) => RESEARCH_MAP[id].name);
  const missingMilestones = [];
  if (node.milestones?.produced) {
    Object.entries(node.milestones.produced).forEach(([res, amt]) => {
      if ((state.resources[res]?.produced || 0) < amt) {
        missingMilestones.push(`${RESOURCES[res]?.name || res} ≥ ${amt}`);
      }
    });
  }
  const cost = node.cost?.science || 0;
  const have = state.resources.science?.amount || 0;
  const needScience = have >= cost ? 0 : cost - have;
  const reasons = { missingPrereqs, missingMilestones, needScience };
  const hasBlock =
    missingPrereqs.length > 0 ||
    missingMilestones.length > 0 ||
    needScience > 0;
  const status =
    hasBlock ||
    (state.research.current && state.research.current.id !== node.id)
      ? 'locked'
      : 'available';
  return { status, reasons };
}

export default function ResearchTree({ onStart }) {
  const { state } = useGame();
  const containerRef = useRef(null);
  const nodeRefs = useRef({});
  const [lines, setLines] = useState([]);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });

  const computeLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newLines = [];
    RESEARCH.forEach((node) => {
      const toEl = nodeRefs.current[node.id];
      if (!toEl) return;
      const toRect = toEl.getBoundingClientRect();
      const x2 = toRect.left + toRect.width / 2 - rect.left;
      const y2 = toRect.top - rect.top;
      (node.prereqs || []).forEach((pr) => {
        const fromEl = nodeRefs.current[pr];
        if (!fromEl) return;
        const fromRect = fromEl.getBoundingClientRect();
        const x1 = fromRect.left + fromRect.width / 2 - rect.left;
        const y1 = fromRect.bottom - rect.top;
        newLines.push({ x1, y1, x2, y2 });
      });
    });
    setLines(newLines);
  }, []);

  useEffect(() => {
    computeLines();
  }, [computeLines, state.research]);

  useEffect(() => {
    window.addEventListener('resize', computeLines);
    return () => window.removeEventListener('resize', computeLines);
  }, [computeLines]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMouseDown = (e) => {
      if (e.button !== 0 || e.target.closest('button')) return;
      isDragging.current = true;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        left: el.scrollLeft,
        top: el.scrollTop,
      };
    };
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      el.scrollLeft = dragStart.current.left - dx;
      el.scrollTop = dragStart.current.top - dy;
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={computeLines}
      className="relative h-full overflow-auto cursor-grab [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <svg className="absolute inset-0 pointer-events-none">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 6 3, 0 6" className="fill-muted-foreground" />
          </marker>
        </defs>
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            className="stroke-muted-foreground"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        ))}
      </svg>
      <div className="flex flex-col gap-8 relative z-10 py-4">
        {RESEARCH_ROWS.map((nodes, idx) => (
          <div key={idx} className="flex gap-8 justify-center">
            {nodes.map((node) => {
              const { status, reasons } = evaluate(node, state);
              return (
                <ResearchNode
                  key={node.id}
                  node={node}
                  status={status}
                  reasons={reasons}
                  onStart={onStart}
                  ref={(el) => (nodeRefs.current[node.id] = el)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
