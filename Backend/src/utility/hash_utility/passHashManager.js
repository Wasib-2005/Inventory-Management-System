import argon2 from "argon2";

export const hashPass = async (password) => {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
    return hash;
  } catch (err) {
    console.error("Hashing failed:", err);
    throw new Error("Password encryption failed");
  }
};

export const compHashPass = async (password, storedHash) => {
  try {
    return await argon2.verify(storedHash, password);
  } catch (err) {
    console.error("Verification failed:", err);
    return false;
  }
};
