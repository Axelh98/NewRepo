// middleware/user.js
function userMiddleware(req, res, next) {
    res.locals.user = req.session.user || null; // Asegúrate de que user esté disponible en todas las vistas
    next();
  }
  
  module.exports = userMiddleware;
  