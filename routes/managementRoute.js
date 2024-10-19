const express = require("express");
const router = express.Router();
const utilities = require("../utilities")
const validation = require("../utilities/classificationValidation");
const inventoryValidation = require("../utilities/inventory-validation")
const managementController = require("../controllers/managmentController")
const checkAccountType = require("../middleware/authMiddleware"); 

router.get("/", utilities.handleErrors(managementController.buildManagement));

router.get("/new-classification", utilities.checkLogin, checkAccountType, utilities.handleErrors(managementController.showNewClassificationForm));

router.get("/new-inventory", utilities.checkLogin, checkAccountType, utilities.handleErrors(managementController.showNewInventoryForm));

router.get("/getInventory/:classification_id", utilities.checkLogin, checkAccountType, utilities.handleErrors(managementController.getInventoryJSON));

router.get("/edit/:inv_id", utilities.checkLogin, checkAccountType, utilities.handleErrors(managementController.editInventoryView));

router.get("/delete/:inv_id", utilities.checkLogin, checkAccountType, utilities.handleErrors(managementController.buildDeleteConfirmationView));




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

  router.post("/delete", utilities.checkLogin, utilities.handleErrors(managementController.deleteVehicle));


module.exports = router;
