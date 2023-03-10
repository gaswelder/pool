export const toErr = (e: unknown) => {
  if (e instanceof Error) {
    return e;
  }
  return new Error(`non-error: ${JSON.stringify(e)}`);
};
