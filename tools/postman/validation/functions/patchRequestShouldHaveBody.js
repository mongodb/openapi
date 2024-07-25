export default (request) => {
  if (request.method !== "PATCH") {
    return;
  }
  const body = request.body;
  if (!body?.raw) {
    return [
      {
        message: `Patch request should have a body.`,
      },
    ];
  }
};
