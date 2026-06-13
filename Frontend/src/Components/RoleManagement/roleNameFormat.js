export function formatPermissionName(permissionString) {
  // 1. Remove the "has" prefix and the "ReadPermission" / "Permission" suffix
  let entity = permissionString
    .replace(/^has/, "") // Removes "has" from the start
    .replace(/(Read|Write|Edit|Delete|Create)?Permission$/, ""); // Removes action + "Permission" from the end

  // 2. Add a space before any uppercase letters to split camelCase
  entity = entity.replace(/([A-Z])/g, " $1").trim();

  // 3. (Optional) If you want it completely lowercase like "product",
  // you can return entity.toLowerCase() instead.
  return entity;
}
