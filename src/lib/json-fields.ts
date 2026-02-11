export const parseJsonField = (value: string | string[]): string[] => {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value || '[]');
  } catch {
    return [];
  }
};

export const serializeArray = (arr: unknown[]): string => JSON.stringify(arr || []);
