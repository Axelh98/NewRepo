const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const vehdet = {}

vehdet.buildVehicleDetail = async function (req, res, next) {
    const vehicleId = req.params.vehicleId
    const vehicle = await invModel.getVehicleDetail(vehicleId)

    if (!vehicle) {
        res.status(404).send("Vehicle not found")
        return
    }

    const vehicleDetail = await utilities.buildVehicleDetail(vehicle) 
    let nav = await utilities.getNav()
    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleDetail,
    })
}

  
module.exports = vehdet