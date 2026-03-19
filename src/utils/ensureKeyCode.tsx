import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft } from 'lucide-react';

const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Control', 'Enter'] as const;

type ArrowKey = typeof arrowKeys[number];

const fixedKeys = new Map<ArrowKey, React.ReactNode>([
  ['ArrowUp', <ArrowUp className="w-4 h-4" />],
  ['ArrowDown', <ArrowDown className="w-4 h-4" />],
  ['ArrowLeft', <ArrowLeft className="w-4 h-4" />],
  ['ArrowRight', <ArrowRight className="w-4 h-4" />],
  ['Enter', <CornerDownLeft className="w-4 h-4" />],
  ['Control', 'Ctrl'],
]);

export const ensureKeyCode = (key: string): React.ReactNode => {
  return fixedKeys.get(key as ArrowKey) ?? key;
};