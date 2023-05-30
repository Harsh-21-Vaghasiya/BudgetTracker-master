const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    id:{
        type: String,
    },
    name: {
        type: String,
    },
    from:{
        type: String,
    },
    to:{
        type: String,
    },
    amount:{
        type: Number,
    },
    note:{
        type: String,
    },
    context:{
        type: String,
    },
    giving:{
        type: Boolean,
    },
    asking: {
        type: Boolean,
    },
    completed:{
        type: Boolean,
        default: false
    },
    askComplition:{
        type: Boolean,
        default: false
    },
    askedBy:{
        type: String,
        default: 'none'
    },
    date:{
        type: String,
    },
    time:{
        type: String,
    }
});

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;