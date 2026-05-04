import argon2 from "argon2";


export const hashPass = async (password) => {
    try {
        // Argon2 handles salting automatically
        const hash = await argon2.hash(password, {
            type: argon2.argon2id, // The most secure variant
            memoryCost: 2 ** 16,   // 64MB
            timeCost: 3,           // Number of iterations
            parallelism: 1         // Number of threads
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

