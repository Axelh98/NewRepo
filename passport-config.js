const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs'); // Asegúrate de tener bcryptjs instalado
const accountModel = require('./models/account-model');


passport.use(new LocalStrategy({
  usernameField: 'account_email', 
  passwordField: 'account_password', 
}, async (email, password, done) => {
  try {
    const accountData = await accountModel.getAccountByEmail(email);
    if (!accountData) {
      return done(null, false, { message: 'Incorrect credentials' });
    }
    const isMatch = await bcrypt.compare(password, accountData.account_password);
    if (isMatch) {
      return done(null, accountData);
    } else {
      return done(null, false, { message: 'Incorrect credentials' });
    }
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.account_id); 
});

passport.deserializeUser(async (account_id, done) => {
  try {
    
    const user = await accountModel.getAccountById(account_id); 
    done(null, user); 
  } catch (error) {
    done(error, null); 
  }
});


module.exports = passport;
