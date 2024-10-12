const pool = require("../database");
const utilities = require("../utilities");
const inventoryModel = require("../models/inventory-model");
const validateInventory = require("../utilities/inventory-validation");

async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/management", {
    title: "Vehicule Management",
    nav,
  });
}

async function showNewClassificationForm(req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/new-classification", {
    title: "Add New classification",
    nav,
    errors: [],
  });
}

const showNewInventoryForm = async (req, res) => {
  let nav = await utilities.getNav();
  const classifications = await utilities.buildClassificationList(); 
  res.render("inventory/new-inventory", {
    title: "New Inventory",
    nav,
    classifications: classifications, 
    errors: req.flash("errors"),
  });
};

// INSERTING DATA ! ! !
// INSERTING DATA ! ! !
// INSERTING DATA ! ! !

const addNewClassification = async (req, res) => {
  const { classificationName } = req.body;

  try {
    await pool.query(
      "INSERT INTO classification (classification_name) VALUES ($1)",
      [classificationName]
    );
    res.redirect("/inv"); // Redirige a la página de inventario o donde necesites
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding new classification"); // Manejo de errores básico
  }
};

const addNewInventory = async (req, res) => {
    const {
      classification,
      make,
      model,
      description,
      image,
      thumbnail,
      price,
      year,
      miles,
      color,
    } = req.body;
  
    try {
      await inventoryModel.addVehicle({
        classification,
        make,
        model,
        description,
        image,
        thumbnail,
        price,
        year,
        miles,
        color,
      });
      
      // Mensaje de éxito
      req.flash('success', 'Vehicle added successfully!');
      res.redirect("/inv");
    } catch (error) {
      console.error("Error adding new vehicle:", error);
      
      // Mensaje de error
      req.flash('error', 'Error adding new vehicle');
      res.redirect("/inv");
    }
  };
  

module.exports = {
  buildManagement,
  showNewClassificationForm,
  showNewInventoryForm,
  addNewClassification,
  addNewInventory,
};
