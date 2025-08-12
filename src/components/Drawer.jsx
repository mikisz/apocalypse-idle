import { useRef } from 'react';
import { useGame } from '../state/useGame.ts';
import { exportSaveFile, load } from '../engine/persistence.js';
import { createLogEntry } from '../utils/log.js';
import { Button } from './Button';
import { Sheet, SheetContent } from './ui/sheet';

export default function Drawer() {
  const { state, toggleDrawer, setState, resetGame } = useGame();
  const fileInput = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setState((prev) => ({
        ...prev,
        log: [
          createLogEntry('Failed to load save: Invalid file type'),
          ...prev.log,
        ].slice(0, 100),
      }));
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result;
        const { state: loaded, migratedFrom } = load(text);
        const note = migratedFrom
          ? `Save loaded (migrated from v${migratedFrom})`
          : 'Save loaded';
        const log = [createLogEntry(note), ...(loaded.log || [])].slice(0, 100);
        setState({ ...loaded, log });
      } catch (err) {
        console.error(err);
        setState((prev) => ({
          ...prev,
          log: [
            createLogEntry(`Failed to load save: ${err.message}`),
            ...prev.log,
          ].slice(0, 100),
        }));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Sheet
      open={state.ui.drawerOpen}
      onOpenChange={(open) => {
        if (open !== state.ui.drawerOpen) toggleDrawer();
      }}
    >
      <SheetContent side="right" className="w-64">
        <div className="p-6 space-y-8">
          <section>
            <h2 className="font-semibold mb-2">📊 Statistics</h2>
            <p className="text-sm text-muted">Coming soon</p>
          </section>
          <section>
            <h2 className="font-semibold mb-2">⚙️ Settings</h2>
            <p className="text-sm text-muted">Coming soon</p>
          </section>
          <section>
            <h2 className="font-semibold mb-2">💾 Save/Load</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  exportSaveFile(state);
                  setState((prev) => ({
                    ...prev,
                    log: [createLogEntry('Save exported'), ...prev.log].slice(
                      0,
                      100,
                    ),
                  }));
                }}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInput.current?.click()}
              >
                Load
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleFile}
              />
            </div>
          </section>
          <section>
            <h2 className="font-semibold mb-2">🧹 Reset</h2>
            <Button variant="outline" size="sm" onClick={resetGame}>
              Reset colony
            </Button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
