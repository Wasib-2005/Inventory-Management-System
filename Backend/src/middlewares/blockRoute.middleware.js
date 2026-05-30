export const blockRouteMiddleware = (req, res, next) => {
  return res.status(404).send("");
};
