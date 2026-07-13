export const createCancelToken = () => {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: (reason) => controller.abort(reason)
  };
};
