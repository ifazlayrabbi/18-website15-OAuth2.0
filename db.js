
require('dotenv').config()
const mongoose = require('mongoose')
// const encrypt = require('mongoose-encryption')
const passportLocalMongoose = require('passport-local-mongoose')
const findOrCreate = require('mongoose-findorcreate')

  // username: {type: String, unique: true, require: true},
  // created: {type: Date, default: Date.now}









mongoose.connect(process.env.CONNECT_DB)
// mongoose.connect('mongodb://127.0.0.1:27017/passportDB')

const userSchema = mongoose.Schema({
  username: {type: String, unique: true, require: true, index: true, sparse: true},
  googleId: String,
  twitterId: String,
  facebookId: String,
  githubId: String,
  name: String,
  secret: String,
  created: {type: Date, default: Date.now}
})

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']})
userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

const User = mongoose.model('User', userSchema)
exports.User = User








// const user1 = new User({
//   username: 'rahim1',
//   email: 'rahim1@gmail.com',
//   password: '1111'
// })
// const user2 = new User({
//   username: 'rahim2',
//   email: 'rahim2@gmail.com',
//   password: '1111'
// })
// user2.save()
// .then(() => console.log('New user registered.'))
// .catch(err => console.log(err.message))
