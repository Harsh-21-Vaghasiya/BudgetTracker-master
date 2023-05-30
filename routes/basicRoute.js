const express = require('express')
const basic = express.Router()
const app = express()
const controller = require('../controller/controller')
const script = require('../middleware/script')
const bodyParser = require('body-parser')
const path = require('path')

app.use(express.static(`${__dirname}/public`))
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }))

basic.route('/').get((req, res) => {
  res.redirect('/login')
})

basic
  .route('/login')
  .get((req, res) => {
    res.render('login', { error: '' })
  })
  .post(controller.login)

basic
  .route('/signup')
  .get((req, res) => {
    res.render('signup')
  })
  .post(controller.signup)

basic.route('/home').get(script.checkSession, (req, res) => {
  res.render('home', { error: false, error2: false, name: req.session.name , email: req.session.email})
})

basic
  .route('/personal')
  .get(script.checkSession, controller.renderPersonal)
  .post(script.checkSession, controller.updatePersonal)
basic
  .route('/chat')
  .get(script.checkSession, controller.renderChat)
  .post(controller.insertChat)

basic.route('/profile').get(script.checkSession, controller.renderProfile).post(controller.updateProfile)

basic.route('/logout').get(controller.logout)

basic.route('/complete').get(script.checkSession, controller.askComplition)
basic.route('/gpay').get((req, res) => {
  res.sendFile(path.join(__dirname, '../gpay.html'))
})
basic.route('/addChat').get(controller.addChat)

module.exports = basic
