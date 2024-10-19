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




  module.exports = { registerAccount , checkExistingEmail , verifyLogin, getAccountByEmail, getAccountById}