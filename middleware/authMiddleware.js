const jwt = require("jsonwebtoken");

function checkAccountType(req, res, next) {
    const token = req.cookies.jwt;
    console.log('CheckAccount Funcionando ! ! ! ');
    console.log('Token:', token); // Verifica si se recibe el token

    if (!token) {  
        req.flash("notice", "You must log in to access this page.");
        return res.redirect("/account/login");
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.log('Error verifying token:', err); // Muestra el error
            req.flash("notice", "Invalid token. Please log in again.");
            return res.redirect("/account/login");
        }

        console.log('Decoded Token:', decoded); // Asegúrate de ver esto
        // Verifica el tipo de cuenta
        if (decoded && (decoded.account_type === "Employee" || decoded.account_type === "Admin")) {
            req.user = decoded; // Puedes almacenar los datos del usuario decodificados
            return next(); // Permite el acceso a la siguiente función o ruta
        } else {
            req.flash("notice", "You do not have permission to access this page.");
            return res.redirect("/account/login");
        }
    });
}

module.exports = checkAccountType;

