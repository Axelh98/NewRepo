const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
*  Process Login
* *************************************** 
async function loginAccount(req, res) {
    let nav = await utilities.getNav();
    const { email, password } = req.body;
  
    const loginResult = await accountModel.verifyLogin(email, password);
  
    if (loginResult) {
      req.flash("notice", `Welcome back!`);
      res.redirect("/dashboard"); 
    } else {
      req.flash("notice", "Invalid email or password.");
      res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Invalid email or password." }],
        email,
      });
    }
  }

*/

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;


  const hashedPassword = await bcrypt.hash(account_password, 10); 

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword 
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

// accountLogin
async function accountLogin(req, res) {
  console.log("accountLogin function called");
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
          title: "Login",
          nav,
          errors: null,
          account_email,
      });
  }

  try {
      console.log("Account Data from DB: ", accountData);
      console.log("Password provided: ", account_password);

      if (await bcrypt.compare(account_password, accountData.account_password)) {
          delete accountData.account_password;
          const token = jwt.sign({ id: accountData.account_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
          req.session.user = { ...accountData, token }; // Guardar en sesión
          console.log("Login successful, redirecting to account management...");
          return res.redirect("/account/management");
      } else {
          console.log("Password mismatch");
      }
  } catch (error) {
      console.error("Error during login process:", error);
      req.flash("notice", "An unexpected error occurred during login.");
      return res.status(500).render("account/login", {
          title: "Login",
          nav,
          errors: [{ msg: "An unexpected error occurred during login." }],
          account_email,
      });
  }

  req.flash("notice", "Please check your credentials and try again.");
  return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
  });
}

// verifyToken middleware
function verifyToken(req, res, next) {
  const token = req.user?.token;

  if (!token) {
      console.log("No token found. Redirecting to login.");
      return res.redirect("/account/login?message=Debes iniciar sesión");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          console.error("Token inválido:", err);
          return res.redirect("/account/login?message=Token inválido");
      }
      req.user = decoded; // Almacenar la información decodificada
      console.log("Token válido. User info:", req.user);
      next(); // 
  });
}

// accountManagement
async function accountManagement(req, res) {
  let nav = await utilities.getNav();
  try {
      console.log("Entering accountManagement...");
      console.log("Session user: ", req.user);

      if (!req.user) {
          return res.redirect("/account/login?message=Debes iniciar sesión");
      }

      const firstName = req.user.account_firstname || "Usuario";
      const accountType = req.user.account_type;

      res.render("account/management", {
          user: req.user,
          nav,
          title: "Account Management",
          firstName,
          accountType,
          messages: req.flash("messages") || {},
          errors: req.flash("errors") || [],
      });
      
  } catch (error) {
      console.error("Error en accountManagement:", error);
      return res.status(500).render("error", {
          message: "Hubo un problema al cargar la vista de gestión de cuentas.",
      });
  }
}




module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  accountManagement,
  verifyToken
};
