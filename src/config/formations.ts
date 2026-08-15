// Formaciones canónicas: cada una define las 11 posiciones exactas de los titulares
// (slot 0 = GK). Vocabulario cerrado de las 12 posiciones (ver @config/positions).
export const FORMATIONS: Record<string, string[]> = {
  '4-4-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'CF', 'CF'],
  '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'LW', 'CF', 'RW'],
  '3-5-2': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'DM', 'CM', 'RM', 'CF', 'CF'],
  '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'DM', 'DM', 'AM', 'LW', 'RW', 'CF'],
  '4-1-4-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'DM', 'LM', 'CM', 'CM', 'RM', 'CF'],
  '5-3-2': ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'CF', 'CF'],
  '3-4-3': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'RM', 'LW', 'CF', 'RW'],
  '4-5-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'DM', 'CM', 'RM', 'CF'],
  '4-4-1-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'AM', 'CF'],
  '3-3-4': ['GK', 'CB', 'CB', 'CB', 'CM', 'CM', 'CM', 'LW', 'CF', 'CF', 'RW'],
};

export function getFormationPositions(formation: string): string[] {
  return FORMATIONS[formation] ?? FORMATIONS['4-4-2'];
}
