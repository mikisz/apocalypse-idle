import React, { useState } from 'react';
import { BUILDING_MAP } from '../data/buildings.js';
import { useGame } from '../state/useGame.ts';
import {
  buildInitialPowerTypeOrder,
  getPoweredConsumerTypeIds,
} from '../engine/power.js';
import { Button } from './Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

export default function PowerPriorityModal({ onClose }) {
  const { state, setState } = useGame();
  const initialOrder = buildInitialPowerTypeOrder(state.powerTypeOrder || []);
  const [order, setOrder] = useState(initialOrder);
  const [dragIndex, setDragIndex] = useState(null);

  const move = (from, to) => {
    if (to < 0 || to >= order.length) return;
    const updated = [...order];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    setOrder(updated);
  };

  const onDragStart = (idx) => () => setDragIndex(idx);
  const onDragOver = (idx) => (e) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    move(dragIndex, idx);
    setDragIndex(idx);
  };
  const onDragEnd = () => setDragIndex(null);

  const save = () => {
    const powered = getPoweredConsumerTypeIds();
    const cleaned = [];
    order.forEach((id) => {
      if (powered.includes(id) && !cleaned.includes(id)) cleaned.push(id);
      else if (!powered.includes(id))
        console.warn('Unknown or non-powered typeId in powerTypeOrder:', id);
    });
    setState((prev) => ({ ...prev, powerTypeOrder: cleaned }));
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Power Priorities</DialogTitle>
        </DialogHeader>
        <div className="text-center text-xs muted-foreground">TOP PRIORITY</div>
        <ul className="mt-2 space-y-1 max-h-64 overflow-y-auto">
          {order.map((id, idx) => {
            const b = BUILDING_MAP[id];
            const count = state.buildings?.[id]?.count || 0;
            return (
              <li
                key={id}
                className="flex items-center justify-between border border-border rounded px-2 py-1"
                draggable
                onDragStart={onDragStart(idx)}
                onDragOver={onDragOver(idx)}
                onDragEnd={onDragEnd}
              >
                <div className="flex items-center gap-2">
                  <span className="cursor-move select-none">☰</span>
                  <span>{b?.name || id}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs muted-foreground">x{count}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-1"
                    onClick={() => move(idx, idx - 1)}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs px-1"
                    onClick={() => move(idx, idx + 1)}
                  >
                    ↓
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="text-center text-xs muted-foreground mt-2">LOW PRIORITY</div>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" size="sm" onClick={save}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
