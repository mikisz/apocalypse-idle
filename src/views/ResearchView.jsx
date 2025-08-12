import { useGame } from '../state/useGame.ts';
import ResearchTree from './research/ResearchTree.jsx';
import { RESEARCH_MAP } from '../data/research.js';
import { formatTime } from '../utils/time.js';
import { Button } from '@/components/Button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default function ResearchView() {
  const { state, beginResearch, abortResearch } = useGame();
  const current = state.research.current;
  const progress = current ? state.research.progress[current.id] || 0 : 0;
  const node = current ? RESEARCH_MAP[current.id] : null;
  const remaining = node ? Math.max(node.timeSec - progress, 0) : 0;
  const pct = node ? Math.min(progress / node.timeSec, 1) : 0;
  return (
    <div className="h-full p-4 pb-20 flex flex-col gap-4">
      {current && node && (
        <Card>
          <CardHeader>
            <CardTitle>Researching: {node.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2 bg-border rounded">
              <div
                className="h-full bg-blue-600 rounded"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
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
          </CardContent>
        </Card>
      )}
      <div className="flex-1 overflow-hidden">
        <ResearchTree onStart={beginResearch} />
      </div>
    </div>
  );
}
