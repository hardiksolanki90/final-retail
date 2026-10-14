/** Value at a dotted path ("area.name") of a nested object; undefined when any step is missing. */
export const readPath = (source: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined), source);
