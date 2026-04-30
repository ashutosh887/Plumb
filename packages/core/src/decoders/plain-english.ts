import type { DecodedInstruction } from '../types.js';

export function renderPlainEnglish(instructions: DecodedInstruction[]): string {
  if (instructions.length === 0) return 'Empty transaction.';
  return instructions
    .map((ix, i) => `${i + 1}. ${ix.plainEnglish}`)
    .join('\n');
}
