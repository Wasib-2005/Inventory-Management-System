const express = require("express");

const logger = require('../../config/logger.js');
const { signUpLogic, signInLogic, refreshAuth } = require("../../controllers/Auth/SingInSingUp.Controller.js");


const router = express.Router()
router.post('/singin',signInLogic)

router.post("/singup",signUpLogic)

router.post("/refresh_auth",refreshAuth)

module.exports = router