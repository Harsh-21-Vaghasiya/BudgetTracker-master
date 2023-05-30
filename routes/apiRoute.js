const express = require('express')
const basic = express.Router()
const app = express()
const controller = require('../controller/controller')
const script = require('../middleware/script')
const bodyParser = require('body-parser')
const path = require('path')

app.use(express.static(`${__dirname}/public`))
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }))

basic.route('/home').get(controller.renderHome);
basic.route('/getname').get(controller.apiGetName);
basic.route('/search').get(controller.getNameApi);
basic.route('/chat').get(controller.apiChat);
basic.route('/getEmail').get(controller.getEmail);

module.exports = basic;