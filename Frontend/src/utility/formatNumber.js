export const formatNumber = (value, options = {}) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";

  return number.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    ...options,
  });
};
