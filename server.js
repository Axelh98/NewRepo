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
const static = require("./routes/static");
const utilities = require("./utilities/");
const bodyParser = require("body-parser")


/* *********************** --frozen-lockfile
 * View Engine and templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

/* ***********************
 * Middleware
 * ************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Inicializa flash
app.use(flash());


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/* ***********************
 * Routes
 *************************/
app.use(static);
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
// Ruta para provocar el error 500 intencionalmente
app.get("/cause-error", (req, res, next) => {
  try {
    throw new Error("Este es un error 500 intencional"); // Genera el error
  } catch (err) {
    next(err); // Pasa el error al middleware
  }
});

app.use("/inv", managementRoute);

app.use("/account", require("./routes/accountRoute"));


app.get("/", function (req, res) {
  res.render("index", { title: "home" });
});

app.get('/inv', (req, res) => {
  const messages = {
    success: req.flash('success'),
    error: req.flash('error'),
  };
  res.render('inventory', { messages });
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
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status == 404) {
    message = err.message;
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?";
  }
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
