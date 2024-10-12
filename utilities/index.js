const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<div class= "card-body">'
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
        grid += '</div>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }



/* **************************************
* Build the vehicle detail HTML
************************************** */
Util.buildVehicleDetail = async function(vehicle) {
  if (!vehicle) {
      return "<p>Vehicle details not found</p>";
  }

  let detail = "";
  detail += '<h1>' + vehicle.inv_year + ' ' + vehicle.inv_make + '</h1>';

  detail += '<div class="wrapper_vehicule">'
    detail += '<div class="vehicle-img">';
    detail += '<img src="' + vehicle.inv_image + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + '">';
    detail += '</div>'

    detail += '<div class="vehicle-detail">'; // Inicia un contenedor para los detalles del vehículo
    detail += '<h1>' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h1>';
    detail += '<p class="veh-price">Price: $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>';
    detail += '<p class="veh-p"><span>Descripcion</span>: ' + vehicle.inv_description + '</p>'
    detail += '<p class="veh-p"><span>Color</span>:' + ' ' + vehicle.inv_color + '</p>'
    detail += '<p class="veh-p"><span>Milles</span>' + ' ' + vehicle.inv_miles + '</p>'
    detail += '</div>'; // Cierra el contenedor
  detail += '</div>'
  return detail;
}


Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  
  classificationList += "</select>";
  return classificationList;
}




  /* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util