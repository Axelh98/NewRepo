const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

router.get("/login", utilities.handleErrors(accountController.buildLogin));


router.get(
  "/management",
  utilities.checkLogin,
  utilities.handleErrors(accountController.accountManagement)
);

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

router.get(
  "/update-account/:id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdate)
);

router.get('/logout', utilities.checkLogin, (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).send('Error al cerrar sesión.');
      }
      res.redirect('/account/login'); 
  });
});

router.post(
  "/login",
  // regValidate.registrationRules(),
  // regValidate.checkRegData,
  utilities.handleErrors(accountController.accountLogin)
);

router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

router.post(
  "/update-account",
  utilities.checkLogin,
  accountController.updateAccount
);

router.post(
  "/change-password",
  utilities.handleErrors(accountController.changePassword)
);



module.exports = router;
