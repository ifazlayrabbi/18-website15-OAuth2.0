
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


app.get('/', (req, res) => {
  res.render('home')
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
