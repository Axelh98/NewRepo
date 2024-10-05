const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get vehicle details by inv_id
 * ************************** */
const getVehicleDetail = async function (vehicleId) {
  try {
      const result = await pool.query(
          'SELECT * FROM public.inventory WHERE inv_id = $1', 
          [vehicleId]
      )
      console.log(result.rows) // Agrega esto para ver si devuelve algo
      return result.rows[0] // Asegúrate de que result.rows[0] tenga el vehículo
  } catch (error) {
      console.error('Error fetching vehicle detail:', error)
      throw error
  }
}



module.exports = {getClassifications, getInventoryByClassificationId, getVehicleDetail};
