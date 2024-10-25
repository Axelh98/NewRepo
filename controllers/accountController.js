const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function buildLogin(req, res, next) {
  const messages = req.flash("notice");
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    messages
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
      errors: null,
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
        delete accountData.account_password
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
        if (process.env.NODE_ENV === 'development') {
            res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        } else {
            res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }
        return res.redirect("/account/management")
    } else {
        req.flash("notice", "The credentials you entered were invalid.")
        res.status(401).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email
        })
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

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
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

    const accounts = await accountModel.getAllAccounts();
      res.render("account/management", {
          // user: req.user,
          nav,
          title: "Account Management",
          messages: req.flash("messages") || {},
          errors: req.flash("errors") || [],
          accounts
      });
      
  } catch (error) {
      console.error("Error en accountManagement:", error);
      return res.status(500).render("error", {
          message: "Hubo un problema al cargar la vista de gestión de cuentas.",
      });
  }
}

async function buildUpdate(req, res) {
  let nav = await utilities.getNav();
  const accountId = req.params.id; 
  const accountData = await accountModel.getAccountById(accountId); 

  if (!accountData) {
    return res.status(404).render("error", {
      message: "Account not found.",
    });
  }

  try {
    res.render("account/update-account", {
      nav,
      accountData,
      title: "Update Account",
      messages: req.flash("messages") || {},
      errors: req.flash("errors") || [],
    });
  } catch (error) {
    console.error("Error en update account:", error);
    return res.status(500).render("error", {
      message: "Hubo un problema al cargar la vista de actualización de cuenta.",
    });
  }
}


const updateAccount = async (req, res) => {
  try {
      console.log(req.body); // Esto mostrará los datos recibidos en la consola
      
      const { account_firstname, account_lastname, account_email, account_id } = req.body;
      
      // Verificar si alguno de los campos requeridos está vacío
      if (!account_firstname || !account_lastname || !account_email || !account_id) {
          return res.status(400).send('Faltan valores obligatorios.');
      }

      // Lógica de actualización de la cuenta
      const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

      if (result) {
          res.redirect('/account/management');
      } else {
          res.status(400).send('No se pudo actualizar la cuenta.');
      }
  } catch (error) {
      console.error('Error al actualizar la cuenta:', error);
      res.status(500).send('Error interno del servidor.');
  }
};


// También debes implementar la función para cambiar la contraseña
async function changePassword(req, res) {
  const { account_id, account_password } = req.body;
  const hashedPassword = await bcrypt.hash(account_password, 10);

  // Lógica para cambiar la contraseña en la base de datos
  const changeResult = await accountModel.changePassword(account_id, hashedPassword);

  if (changeResult) {
    req.flash("messages", { success: "Password changed successfully!" });
    return res.redirect("/account/management");
  } else {
    req.flash("messages", { error: "Failed to change password." });
    return res.redirect(`/account/update/${account_id}`);
  }
}

async function editAccountForm(req, res) {
  const accountId = req.params.id;
  const account = await accountModel.getAccountById(accountId); 
  
  let nav = await utilities.getNav();
  res.render('account/edit-account', {
    title: "Edit Account",
    nav,
    account,
    errors: null,
  });
}

async function updateOtherAccount(req, res) {
  const accountId = req.params.id;
  const { account_firstname, account_lastname, account_email, account_type } = req.body;

  const updateResult = await accountModel.updateOtherAccount(
    accountId,
    account_firstname,
    account_lastname,
    account_email,
    account_type
  );

  if (updateResult) {
    req.flash("notice", "Account updated successfully.");
    res.redirect("/account/management");
  } else {
    req.flash("notice", "Account update failed.");
    res.redirect(`/account/edit/${accountId}`);
  }
}







module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  accountManagement,
  verifyToken,
  buildUpdate,
  updateAccount,
  changePassword,
  editAccountForm,
  updateOtherAccount
};
