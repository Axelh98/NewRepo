const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs")

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

  // Hashear la contraseña antes de guardarla en la base de datos
  const hashedPassword = await bcrypt.hash(account_password, 10); // 10 es el número de salt rounds

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword // Usa el hash en lugar de la contraseña en texto plano
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


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  console.log("accountLogin function called")

  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  // Verifica si se obtuvo accountData
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    // Agrega un console.log para verificar los valores antes de comparar las contraseñas
    console.log("Account Data from DB: ", accountData)
    console.log("Password provided: ", account_password)

    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })

      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      // Agrega un mensaje de consola para saber si la comparación fue exitosa
      console.log("Login successful, redirecting to account management...")

      return res.redirect("/account/management")
    } else {
      // Si las contraseñas no coinciden, agrega otro mensaje de consola
      console.log("Password mismatch")
    }
  } catch (error) {
    // En caso de error, captura y muestra el mensaje de error
    console.error("Error during login process:", error)
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "An unexpected error occurred during login." }],
      account_email,
    })
  }

  req.flash("notice", "Please check your credentials and try again.")
  res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
  })
}




async function accountManagement(req, res) {
  let nav = await utilities.getNav()
  try {
    res.render("account/management", {
      title: "Account Management",
      nav,
      messages: req.flash("info"),
      errors: req.flash("errors"),
    });
  } catch (error) {
    console.error("Error rendering account management:", error);
    res.status(500).send("Server Error");
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  accountManagement,
};
