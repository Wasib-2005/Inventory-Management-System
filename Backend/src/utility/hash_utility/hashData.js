const bcrypt = require('bcrypt');

export const hashData = async (password) => {
    const saltRounds = 12; // A good balance between security and performance in 2026
    return await bcrypt.hash(password, saltRounds);
};