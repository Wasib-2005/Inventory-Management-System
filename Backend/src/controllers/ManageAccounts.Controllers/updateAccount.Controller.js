import { hybridDecryption } from "../../utility/ecryptionDecryption.js"

export const updateAccount = async (req,res) => {
    const data = req.body
    const plain = hybridDecryption(data)
    console.log(plain)
    // const role = plain.
    res.send("ok")
}