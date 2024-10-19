const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');
const passport = require('passport'); // Asegúrate de importar passport


router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get('/management', utilities.checkLogin, utilities.handleErrors(accountController.accountManagement));

router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.post("/login", 
    passport.authenticate('local', {
        successRedirect: '/account/management',
        failureRedirect: '/login', 
        failureFlash: true 
    })
);

router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;
