import { useGame } from '../state/useGame.ts';
import ResearchTree from './research/ResearchTree.jsx';
import { RESEARCH_MAP } from '../data/research.js';
import { formatTime } from '../utils/time.js';
import { Button } from '@/components/Button';

export default function ResearchView() {
  const { state, beginResearch, abortResearch } = useGame();
  const current = state.research.current;
  const progress = current ? state.research.progress[current.id] || 0 : 0;
  const node = current ? RESEARCH_MAP[current.id] : null;
  const remaining = node ? Math.max(node.timeSec - progress, 0) : 0;
  const pct = node ? Math.min(progress / node.timeSec, 1) : 0;
  return (

    <div className="p-4 pb-20 space-y-4 h-full flex flex-col">

      <div className="border border-stroke rounded p-4 bg-bg2/50">
        {current && node ? (
          <div className="space-y-2">
            <div className="font-semibold">Researching: {node.name}</div>
            <div className="h-2 bg-stroke rounded">
              <div
                className="h-full bg-blue-600 rounded"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Time remaining: {formatTime(remaining)}</span>
              <Button
                variant="outline"
                size="sm"
                className="border-red-400 text-red-300 hover:bg-red-900/20"
                onClick={() => {
                  if (window.confirm('Cancel research?')) abortResearch();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>No research in progress.</div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <ResearchTree onStart={beginResearch} />
      </div>
    </div>
  );
}
