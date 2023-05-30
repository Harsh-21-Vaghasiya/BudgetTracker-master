const mongoose = require('mongoose')

const dailySchema = new mongoose.Schema({
  amount: {
    type: Number,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  got: {
    type: Boolean,
  },
  context: {
    type: String,
  },
  description: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  }
})

const Daily = mongoose.model('Daily', dailySchema)

module.exports = Daily
