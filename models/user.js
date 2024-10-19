const pool = require('../database'); // Asegúrate de que esta ruta sea correcta

// Función para encontrar un usuario por nombre de usuario
const findUserByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0]; // Retorna el primer usuario encontrado
};

// Función para agregar un nuevo usuario
const addUser = async (username, password) => {
  const result = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
    [username, password]
  );
  return result.rows[0]; // Retorna el nuevo usuario creado
};

// Exporta las funciones
module.exports = {
  findUserByUsername,
  addUser,
};
