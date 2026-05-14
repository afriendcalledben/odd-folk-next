export const COLOUR_OPTIONS = [
  'Black', 'White', 'Grey', 'Beige', 'Brown', 'Red', 'Blue', 'Green',
  'Yellow', 'Orange', 'Pink', 'Purple', 'Gold', 'Silver', 'Copper', 'Natural', 'Cream',
];

export const COLOUR_HEX: Record<string, string> = {
  Black: '#1a1a1a',
  White: '#ffffff',
  Grey: '#9ca3af',
  Beige: '#d4b896',
  Brown: '#92400e',
  Red: '#dc2626',
  Blue: '#2563eb',
  Green: '#16a34a',
  Yellow: '#eab308',
  Orange: '#ea580c',
  Pink: '#ec4899',
  Purple: '#9333ea',
  Gold: '#d97706',
  Silver: '#94a3b8',
  Copper: '#b45309',
  Natural: '#a3825a',
  Cream: '#fef3c7',
};

const LIGHT_COLOURS = new Set(['White', 'Cream', 'Beige', 'Natural', 'Silver', 'Grey', 'Yellow']);

export function pillTextClass(colour: string): string {
  return LIGHT_COLOURS.has(colour) ? 'text-gray-800' : 'text-white';
}
