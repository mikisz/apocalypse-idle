import React, { useEffect, useRef } from 'react';
import { RESEARCH, RESEARCH_MAP } from '../../data/research.js';
import ResearchNode from './ResearchNode.jsx';
import { useGame } from '../../state/useGame.tsx';
import { RESOURCES } from '../../data/resources.js';

const RESEARCH_TRACKS = RESEARCH.reduce((acc, r) => {
  acc[r.track] = acc[r.track] || [];
  acc[r.track].push(r);
  return acc;
}, []);
RESEARCH_TRACKS.forEach((track) => track.sort((a, b) => a.row - b.row));

// Column offsets for each track to allow shifting entire tracks horizontally
const TRACK_OFFSETS = [0, 0, 2];

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
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
    }
  }, []);

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
    const onTouchStart = (e) => {
      if (e.touches.length !== 1 || e.target.closest('button')) return;
      isDragging.current = true;
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        left: el.scrollLeft,
        top: el.scrollTop,
      };
    };
    const onTouchMove = (e) => {
      if (!isDragging.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      el.scrollLeft = dragStart.current.left - dx;
      el.scrollTop = dragStart.current.top - dy;
    };
    const onTouchEnd = () => {
      isDragging.current = false;
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-auto cursor-grab [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex flex-col gap-16 relative z-10 p-4">
        {RESEARCH_TRACKS.map((nodes, idx) => {
          const cols = nodes.reduce((acc, n) => {
            acc[n.row] = acc[n.row] || [];
            acc[n.row].push(n);
            return acc;
          }, []);
          const offset = TRACK_OFFSETS[idx] || 0;
          const paddedCols = [...Array(offset).fill(null), ...cols];
          return (
            <div key={idx} className="flex gap-8 items-center">
              {paddedCols.map((col, cIdx) => (
                <div key={cIdx} className="flex flex-col gap-8 items-center">
                  {col &&
                    col.map((node) => {
                      const { status } = evaluate(node, state);
                      return (
                        <ResearchNode
                          key={node.id}
                          node={node}
                          status={status}
                          onStart={onStart}
                        />
                      );
                    })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
