import React from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';

export default function BanishSettlerModal({ settler, onCancel, onConfirm }) {
  if (!settler) return null;
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Banish settler?</DialogTitle>
          <DialogDescription>
            Are you sure you want to banish {settler.firstName}{' '}
            {settler.lastName}? {settler.sex === 'M' ? 'He' : 'She'} will be
            lost forever.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Banish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
