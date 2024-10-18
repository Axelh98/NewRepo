const express = require("express");
const router = express.Router();
const utilities = require("../utilities")
const validation = require("../utilities/classificationValidation");
const inventoryValidation = require("../utilities/inventory-validation")
const managementController = require("../controllers/managmentController")


router.get("/", utilities.handleErrors(managementController.buildManagement))

router.get("/new-classification", utilities.handleErrors(managementController.showNewClassificationForm));

router.get("/new-inventory", utilities.handleErrors(managementController.showNewInventoryForm));

router.get("/getInventory/:classification_id", utilities.handleErrors(managementController.getInventoryJSON))

router.get("/edit/:inv_id", utilities.handleErrors(managementController.editInventoryView));


// POST route to add new classification with validation
router.post(
    "/new-classification", 
    validation.classificationRules(),
    validation.checkClassificationData,
    utilities.handleErrors(managementController.addNewClassification)
  );

  router.post(
    "/new-inventory",
    inventoryValidation.newInventoryRules(),
    inventoryValidation.checkNewInventoryData,
    utilities.handleErrors(managementController.addNewInventory)
  );

  router.post("/update/", utilities.handleErrors(managementController.updateInventory))
  

module.exports = router;
