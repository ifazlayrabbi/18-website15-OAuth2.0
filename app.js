
'use strict'

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

require('dotenv').config()
app.set('view engine', 'ejs')
app.use(express.static('public'))
const _ = require('lodash')
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GitHubStrategy = require('passport-github2').Strategy

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const session = require('express-session')
const passport = require('passport')
const flash = require('express-flash')
app.use(flash())

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

const {User} = require('./db')
const {passport_authentication} = require('./authentication_by_passport')










passport_authentication(passport, User)

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://share-my-secrets.onrender.com/auth/google/secrets"
 },
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id, name: profile.displayName }, function (err, user) {
    return cb(err, user);
  })
}
))

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "https://share-my-secrets.onrender.com/auth/facebook/secrets"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ facebookId: profile.id, name: profile.displayName }, function (err, user) {
    return cb(err, user)
  })
}
))

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "https://share-my-secrets.onrender.com/auth/github/secrets"
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile)
  User.findOrCreate({ githubId: profile.id, name: profile.displayName }, function (err, user) {
    return done(err, user);
  })
}
))






app.get('/', (req, res) => {
  res.render('home')
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
)

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/secrets')
  }
)

app.get('/auth/facebook',
  passport.authenticate('facebook'))

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/secrets')
  })

app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }))

app.get('/auth/github/secrets', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/secrets')
  })







app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login')
})

// app.get('/secrets', (req, res) => {
//   if(req.isAuthenticated())
//     res.render('secrets')
//   else
//     res.redirect('/login')
// })

app.get('/secrets', checkAuthenticated, (req, res) => {
  res.render('secrets')
})

function checkAuthenticated (req, res, next) {
  if(req.isAuthenticated())
    return next()
  res.redirect('/login')
}

function checkNotAuthenticated (req, res, next) {
  if(req.isAuthenticated())
    return res.redirect('/secrets')
  next()
}

app.delete('/logout', (req, res, next) => {
  req.logout(err => {
    if(err)
      return next(err)
    res.redirect('/login')
  })
})

app.get('/submit', (req, res) => {
  res.render('submit')
})

app.post('/submit', (req, res) => {
  const secret = req.body.secret
  res.send('<h2>'+ secret + '</h2>')
})



app.get('/tos', (req, res) => {
  res.render('others/tos')
})
app.get('/privacy', (req, res) => {
  res.render('others/privacy')
})











//////////////////////  Passport Authentication - using MongoDB /////////////////////

function passportAuth () {

  app.post('/register', async (req, res) => {
    const email = _.toLower(req.body.email)
    const password = req.body.password

    if(email && password){
      const found = await User.find({email: email})
      if(found != ''){
        console.log('Already Registered')
        res.send('<h2>Already Registered <a href="/login">Login</a></h2>')
      }
      else{
        try{
          const registerUser = await User.register({username: email}, password)
          if(registerUser){
            passport.authenticate('local')(req, res, function(){
              console.log('New user registered.')
              res.redirect('/secrets')
            })
          } else{
            res.redirect('/register')
          }
        } catch (err) {
          console.log(err)
          res.redirect('/register')
        }
      }
    }
    else{
      console.log('Email or password missing!')
      res.redirect('/register')
    }
  })
  
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', { 
    successRedirect: '/secrets',
    failureRedirect: '/login',
    failureFlash: true
  }))
}
passportAuth()

//////////////////////////////////////////////////////////////////////














const port = process.env.PORT || 3000
app.listen(port, () => console.log('Server running on port ' + port))
