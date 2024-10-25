const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1"
      const email = await pool.query(sql, [account_email])
      return email.rowCount
    } catch (error) {
      return error.message
    }
  }


/* **********************
 * Verify login credentials
 * ********************* */
async function verifyLogin(email, password) {
  try {
      const accountData = await getAccountByEmail(email);
      if (!accountData) {
          return false; // Si no hay un usuario con ese email
      }
      // Comparar la contraseña proporcionada con la hash almacenada
      const isMatch = await bcrypt.compare(password, accountData.account_password);
      return isMatch;
  } catch (error) {
      return false;
  }
}


  /* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function getAccountById(id) {
  const query = 'SELECT * FROM account WHERE account_id = $1'; // Cambia el nombre de la tabla y la columna según tu esquema
  const values = [id];
  
  try {
      const res = await pool.query(query, values);
      return res.rows[0]; // Retorna el primer registro encontrado
  } catch (error) {
      throw new Error('Error fetching account: ' + error.message);
  }
}


const updateAccount = async (account_id, account_firstname, account_lastname, account_email) => {
  try {
      const query = `
          UPDATE account 
          SET account_firstname = $1, account_lastname = $2, account_email = $3 
          WHERE account_id = $4
      `;
      const values = [account_firstname, account_lastname, account_email, parseInt(account_id)];
      const result = await pool.query(query, values);

      return result.rowCount; // Verifica si se actualizó alguna fila
  } catch (error) {
      console.error('Error al actualizar la cuenta:', error);
      throw error;
  }
};




async function changePassword(accountId, newPassword) {
  try {
      // Actualiza la contraseña en la base de datos
      const result = await pool.query(
          `UPDATE account SET account_password = $1 WHERE account_id = $2`,
          [newPassword, accountId]
      );

      return result.rowCount > 0; // Devuelve true si la actualización fue exitosa
  } catch (error) {
      console.error("Error cambiando la contraseña:", error);
      throw error; // Propaga el error para manejarlo en el controlador
  }
}


async function getAllAccounts() {
  try {
      const sql = 'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account';
      const result = await pool.query(sql);
      return result.rows; // Devuelve todas las filas encontradas
  } catch (error) {
      console.error('Error al obtener la lista de cuentas:', error);
      throw error; // Propaga el error para manejarlo en el controlador
  }
}



  module.exports = { registerAccount , checkExistingEmail , verifyLogin, getAccountByEmail, getAccountById, updateAccount, changePassword, getAllAccounts}