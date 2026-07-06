const bcrypt = require("bcrypt");

export const hashData = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};
