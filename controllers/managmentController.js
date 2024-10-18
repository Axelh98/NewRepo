const pool = require("../database");
const utilities = require("../utilities");
const inventoryModel = require("../models/inventory-model");
const validateInventory = require("../utilities/inventory-validation");

async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
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
  const classification_id = await utilities.buildClassificationList();
  res.render("inventory/new-inventory", {
    title: "New Inventory",
    nav,
    classification_id: classification_id,
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
    classification_id, // Cambiado aquí
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;

  try {
    // Aquí asegúrate de que classification_id no esté vacío
    if (!classification_id) {
      req.flash("error", "Classification is required");
      return res.redirect("/inv/new-inventory"); // Redirigir a la página del formulario
    }

    await inventoryModel.addVehicle({
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });

    req.flash("success", "Vehicle added successfully");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error adding new vehicle:", error);
    req.flash("error", "Could not add vehicle");
    res.redirect("/inv");
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
async function getInventoryJSON(req, res, next) {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await inventoryModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
async function editInventoryView(req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await inventoryModel.getVehicleDetail(inv_id);
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await inventoryModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

module.exports = {
  buildManagement,
  showNewClassificationForm,
  showNewInventoryForm,
  addNewClassification,
  addNewInventory,
  getInventoryJSON,
  editInventoryView,
  updateInventory
};
