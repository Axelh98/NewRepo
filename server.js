/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const pool = require("./database/");
const env = require("dotenv").config();
const app = express();
const baseController = require("./controllers/basecontroller");
const inventoryRoute = require("./routes/inventoryRoute");
const managementRoute = require("./routes/managementRoute");
const accountRoutes = require('./routes/accountRoute');
const static = require("./routes/static");
const utilities = require("./utilities/");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");



/* ***********************
 * View Engine and templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));

app.use(passport.initialize());
app.use(passport.session()); 


app.use((req, res, next) => {
  res.locals.user = req.user; 
  res.locals.loggedin = req.isAuthenticated ? req.isAuthenticated() && req.user : false; 
  next();
});


app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());


app.use(flash());
app.use(cookieParser());
app.use(utilities.checkJWTToken);


/* ***********************
 * Routes
 *************************/
app.use(static);
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/inv", managementRoute);
app.use("/account", accountRoutes);

// Ruta para provocar el error 500 intencionalmente
app.get("/cause-error", (req, res, next) => {
  try {
    throw new Error("Este es un error 500 intencional"); // Genera el error
  } catch (err) {
    next(err); // Pasa el error al middleware
  }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack); // Muestra el error en la consola
  const status = err.status || 500; // Obtiene el código de estado
  res.status(status).render("error", {
    title: "Server Error",
    message: err.message,
    status: status,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});


module.exports = app;