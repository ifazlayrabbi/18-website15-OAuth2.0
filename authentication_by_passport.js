
const LocalStrategy = require('passport-local')





exports.passport_authentication = (passport, User) => {
  
  passport.use(new LocalStrategy({usernameField: 'email'}, User.authenticate()))
  
  passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

}





// exports.passport_authentication = (passport, getUserByEmail, getUserById) => {
  
//   passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
//   passport.serializeUser ((user, done) => done(null, user._id))
//   passport.deserializeUser ((_id, done) => done(null, getUserById(_id)))


//   async function authenticateUser (email, password, done) {
//     const user = getUserByEmail(email)
//     if(user == null)
//       return done(null, false, {message: 'No user with that email.'})
//     try{
//       if(await bcrypt.compare(password, user.password))
//         return done(null, user)
//       else
//         return done(null, false, {message: 'Password incorrect.'})
//     }
//     catch (err) {return done(err)}
//   }
// }




