const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Login
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post("/login", utilities.handleErrors(accountController.accountLogin));

// Register
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));

// Account Management
router.get("/management", utilities.checkLogin, utilities.handleErrors(accountController.accountManagement));

// Update Account (for logged-in user)
router.get("/update-account/:id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdate));
router.post("/update-account/:id", utilities.checkLogin, utilities.handleErrors(accountController.updateAccount));

// Update Other Account (Admin only)
router.get("/edit/:id", utilities.checkLogin, utilities.handleErrors(accountController.editAccountForm));
router.post("/update/:id", utilities.checkLogin, utilities.handleErrors(accountController.updateOtherAccount));

// Change Password
router.post("/change-password", utilities.checkLogin, utilities.handleErrors(accountController.changePassword));

// Logout
router.get('/logout', utilities.checkLogin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error al cerrar sesión.');
        }
        res.redirect('/account/login'); 
    });
});

module.exports = router;
