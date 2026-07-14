const ASSET_BASE = (
  import.meta.env.VITE_AWS_HEADER ||
  import.meta.env.VITE_BACKEND_API_HEADER ||
  import.meta.env.VITE_ASSET_BASE_URL ||
  ""
).replace(/\/$/, "");

export const makeImageUrl = (path) => {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  if (!ASSET_BASE) return path;

  return `${ASSET_BASE}/${path.replace(/^\//, "")}`;
};
