const express = require("express");

const logger = require('../../config/logger.js');
const { singInLogic, signUpLogic, } = require("../../controllers/Auth/SingInSingUp.Controller.js");

const router = express.Router()
router.post('/singin',singInLogic)

router.post("/singup",signUpLogic)

module.exports = router