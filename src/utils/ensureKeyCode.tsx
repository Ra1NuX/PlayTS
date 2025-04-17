import { TiArrowUp, TiArrowLeft, TiArrowRight, TiArrowDown } from 'react-icons/ti';
import { TbCornerDownLeft } from 'react-icons/tb';

const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Control', 'Enter'] as const;

type ArrowKey = typeof arrowKeys[number];

const fixedKeys = new Map<ArrowKey, React.ReactNode>([
  ['ArrowUp', <TiArrowUp size={16} />],
  ['ArrowDown', <TiArrowDown size={16} />],
  ['ArrowLeft', <TiArrowLeft size={16} />],
  ['ArrowRight', <TiArrowRight size={16} />],
  ['Enter', <TbCornerDownLeft size={16} />],
  ['Control', 'Ctrl'],
]);

export const ensureKeyCode = (key: string): React.ReactNode => {
  return fixedKeys.get(key as ArrowKey) ?? key;
};