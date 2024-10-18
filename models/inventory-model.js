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

async function checkExistingClassification(classificationName) {
  try {
    const result = await pool.query(
      "SELECT * FROM classification WHERE classification_name = $1",
      [classificationName]
    );
    return result.rowCount > 0; // Retorna true si ya existe
  } catch (err) {
    console.error("Error checking existing classification", err);
    return false;
  }
}

/* ***************************
 *  Add a new vehicle to the inventory
 * ************************** */
async function addVehicle({
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
}) {
  const query = `
    INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;

  const values = [classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color];

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error("Error inserting vehicle into database:", error);
    throw error; // Propaga el error para que pueda ser manejado en la función llamante
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}



module.exports = {getClassifications, getInventoryByClassificationId, getVehicleDetail, checkExistingClassification, addVehicle, updateInventory};
