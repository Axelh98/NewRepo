const utilities = require("../utilities");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  
  // Captura los mensajes flash
  const messages = req.flash("notice"); // Cambia "notice" por el tipo de mensaje que estés utilizando
  res.render("index", { title: "Home", nav, user: req.session.user, messages }); // Pasa 'messages' a la vista
};

module.exports = baseController;
