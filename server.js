const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = express();
let startserver;

dotenv.config({ path: './config.env' });
const port = process.env.PORT || 3000;
const url = process.env.URL || "mongodb://localhost:27017/budgetTracker";

startserver = async ()=>{
    await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    console.log('Database connected');
    // throw no internet text to client 
    
}

module.exports = startserver;

