export async function measureResponseTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: string }> {
  const start = Date.now();

  const result = await fn();

  const end = Date.now();
  const seconds = ((end - start) / 1000).toFixed(2);

  return { result, duration: `${seconds} sec` };
}
