import { useEffect, useRef } from 'react';
import { saveGame } from '../../engine/persistence.js';

export default function useAutosave(state: any, setState: any) {
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const save = () => {
      setState(() => saveGame(stateRef.current));
    };
    const id = setInterval(save, 10000);
    window.addEventListener('beforeunload', save);
    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', save);
    };
  }, [setState]);
}
