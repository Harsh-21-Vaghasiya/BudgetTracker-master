const express = require('express')
const app = express()
const startserver = require('./server')
const dotenv = require('dotenv')
const session = require('express-session')
const cookieParser = require('cookie-parser');
const path = require('path')
const staticpath = path.join(__dirname, 'public')
// const script = require('./middleware/script')

const port = process.env.PORT || 3000;
const http = require('http').Server(app);
const socket =require('./socket.js');
http.listen(port,()=>{
  console.log(`server started in ${port}`)
  console.log(`url :- http://127.0.0.1:4000`);
});
const io = socket.init(http);

const controller = require('./controller/controller')

const bodyParser = require('body-parser')
const router = require('./routes/basicRoute');
const apiRouter = require('./routes/apiRoute');
const script = require('./middleware/script');

app.use(express.static(staticpath))
app.use(express.static(`${__dirname}/public`))
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs')
dotenv.config({ path: './config.env' })
const maxAge = 24*60*60*1000;
app.use(
  session({
    secret: 'anythingbutnotasecretsupercell',
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: maxAge },
  }),
)

// const checksession = require("./middleware/script");
// app.use(checksession);
app.use('/',script.checkSession,router);
app.use('/api',script.checkSession,apiRouter);

startserver();

