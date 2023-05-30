const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    name:{
        type: String,
        default: 'default'
    },
    main: {
        type: String,
    },
    chatWith: {
        type: String,
    }
})

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;