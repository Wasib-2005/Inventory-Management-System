import argon2 from "argon2"

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
        // Handle error (e.g., logging)
        console.error("Hashing failed:", err);
    }
};
// To verify 
export const verifyUserPass = async (password, storedHash) => {
    // argon2 looks at the 'storedHash', extracts the embedded salt,
    // and checks if the password matches.
    return await argon2.verify(storedHash, password); 
};