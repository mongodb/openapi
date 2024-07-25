export default (request) => {
  if (!request.method || request.method !== "PATCH") {
    return;
  }
  const body = request.body;
  if (!body || !body.raw) {
    return [
      {
        message: `Patch request should have a body.`,
      },
    ];
  }
};
