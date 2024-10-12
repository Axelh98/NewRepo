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
}) {
  const query = `
    INSERT INTO public.inventory (classification_id, make, model, description, image, thumbnail, price, year, miles, color)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;

  const values = [classification, make, model, description, image, thumbnail, price, year, miles, color];

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error("Error inserting vehicle into database:", error);
    throw error; // Propaga el error para que pueda ser manejado en la función llamante
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getVehicleDetail, checkExistingClassification, addVehicle};
