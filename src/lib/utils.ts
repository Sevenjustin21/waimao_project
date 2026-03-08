export function cn(
  ...inputs: Array<
    | string
    | number
    | null
    | undefined
    | false
    | Record<string, boolean>
  >
): string {
  return inputs
    .flatMap((input) => {
      if (!input) return [];
      if (typeof input === 'string' || typeof input === 'number') {
        return [input];
      }
      return Object.entries(input)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key);
    })
    .join(' ');
}
