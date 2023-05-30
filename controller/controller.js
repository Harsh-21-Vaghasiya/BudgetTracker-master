const mongoose = require('mongoose')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const User = require('../model/User')
const Chat = require('../model/Chat')
const connections = require('../model/Connection')
const Daily = require('../model/Daily')
const socketFile = require('../socket.js')

app.use(express.static(`${__dirname}/public`))
app.use(express.static(`${__dirname}/public`))
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }))

const socket = socketFile.io()
var count = 0

// id - mail mapping 
var id = {}

socket.on('connection', (socket) => {
  console.log(`user ${count} connected with id ${socket.id}`)
  count++
  socket.on('disconnect', () => {
    count--

    for (var key in id) {
      if (id[key] == socket.id) {
        delete id[key]
      }
    }

    console.log('user disconnected with id ' + socket.id)
  })

  socket.on('setID', (msg) => {
    id[msg] = socket.id
    console.log(msg, 'message', id)
  })

  socket.on('java', (msg) => {
    console.log(msg , "@@@@")
  })

  socket.emit("java2",{'k':"hello from server",'m':"bye from server"})
});

//! async - to not wait till data entered in db and continue other work
exports.login = async (req, res) => {
  try {
    console.log(req.body);
    // validate email with regex
    const user = await User.findOne({
      email: req.body.email,
    })
    if (user) {
      if (user.password != req.body.password) {
        res.status(200).render('login', { error: 'wrong password' })
      } else {
        sessions = req.session
        sessions.email = user.email
        sessions.Name = user.name
        sessions.mobile = user.mobile
        console.log(user.name, 'Logged in')
        id[user.email] = socket.id
        res.status(200).redirect(req.session.url || '/home')
      }
    } else {
      res.redirect('/signup')
    }
  } catch (err) {
    res.status(500).send(err.message)
  }
}



exports.signup = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    })
    if (user) {
      res.status(200).redirect('/login')
    } else {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        mobile: req.body.mobile,
        gender: req.body.gender,
      })
      await user.save()
      sessions = req.session
      sessions.email = user.email
      sessions.Name = user.name
      sessions.mobile = user.mobile
      id[user.email] = socket.id
      res.status(200).redirect(req.session.url || '/')
    }
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.renderHome = async (req, res) => {
  try {
    sessions = req.session
    const email = sessions.email
    const chats = await connections.find({
      $or: [{ main: email }, { chatWith: email }],
    })
    id[email] = socket.id
    res
      .status(200)
      .json({ data: chats, email: email, error: false, error2: false })
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.renderChat = async (req, res) => {
  try {
    sessions = req.session
    const email = sessions.email
    const email2 = req.query.to
    if (email == email2) {
      res.redirect('/personal')
    } else {
      const chats = await Chat.find({
        $or: [
          { from: email, to: email2 },
          { from: email2, to: email },
        ],
      })
      const user = await User.findOne({ email: req.query.to })
      id[email] = socket.id
      res.render('chat', {
        data: chats,
        main: email,
        user,
        email: req.query.to,
      })
    }
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.apiChat = async (req, res) => {
  try {
    sessions = req.session
    const email = sessions.email
    const email2 = req.query.to
    const chats = await Chat.find({
      $or: [
        { from: email, to: email2 },
        { from: email2, to: email },
      ],
    })
    res.send({ data: chats })
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.insertChat = async (req, res) => {
  try {
    sessions = req.session
    console.log(req.query, req.body)
    const asking = req.query.send == 'false' ? true : false
    const user = await User.findOne({ email: req.query.to })
    const chat = new Chat({
      name: user.name,
      from: sessions.email,
      to: req.query.to,
      amount: req.body.amount,
      note: req.body.note,
      context: req.body.context,
      giving: !asking,
      asking: asking,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    })
    await chat.save()
    socket.to(id[req.query.to]).emit('newChat', chat)
    console.log(id, 'seng msg', chat)
    
    res.status(200).json(chat)
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.addChat = async (req, res) => {
  try {
    sessions = req.session
    const email = req.query.email
    const email2 = sessions.email
    if (email == email2) {
      res.redirect('/personal');
    } else {
      const user = await User.findOne({ email: email })
      if (user) {
        const connection = await connections.findOne({
          $or: [
            {
              main: email,
              chatWith: email2,
            },
            {
              main: email2,
              chatWith: email,
            },
          ],
        })
        if (connection) {
          res.status(200).redirect(`/chat?to=${email}`)
        } else {
          const connection = new connections({
            name: user.name,
            main: sessions.email,
            chatWith: email,
          })
          await connection.save()
          socket.to(id[email]).emit('connection', { data: connection })
          console.log('connection message sent', email, id[email], id)
          res.status(200).redirect(`/chat?to=${email}`)
          // res.render('home', { error: false, error2: false, email: email2, name: sessions.Name,visible:true}));
        }
      } else {
        res.render('home', {
          error: true,
          error2: false,
          email: email2,
          name: sessions.Name,
          visible: true,
        })
      }
    }
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.renderProfile = async (req, res) => {
  try {
    sessions = req.session
    const email = sessions.email
    const user = await User.findOne({ email: email })
    if (user) {
      res.render('profile', { data: user })
    } else {
      res.redirect('/home')
    }
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.logout = (req, res) => {
  delete id[req.session.email]
  req.session.destroy()
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.redirect('/login')
}

exports.askComplition = async (req, res) => {
  try {
    const sessions = req.session
    const email = sessions.email
    const id2 = req.query.id
    console.log(req.query)
    var chat = null
    if (req.query.accept == 'true') {
      chat = await Chat.findOneAndUpdate(
        { _id: id2 },
        {
          completed: true,
          askComplition: false,
          askedBy: 'none',
        },
        { new: true },
      )
      socket
        .to(id[req.query.to])
        .emit('setOption', { id: id2, message: 'accepted' })
    } else if (req.query.accept == 'false') {
      chat = await Chat.findOneAndUpdate(
        { _id: id2 },
        {
          completed: false,
          askComplition: false,
          askedBy: 'none',
        },
        { new: true },
      )
      socket
        .to(id[req.query.to])
        .emit('setOption', { id: id2, message: 'rejected' })
    } else {
      chat = await Chat.findOneAndUpdate(
        { _id: id2 },
        {
          completed: false,
          askComplition: true,
          askedBy: email,
        },
        { new: true },
      )
      console.log('message sent')
      socket
        .to(id[req.query.to])
        .emit('setOption', { id: id2, message: 'option' })
    }
    res.status(200).json({ id: id2, message: 'done' })
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.renderPersonal = async (req, res) => {
  try {
    sessions = req.session
    const email = sessions.email
    const user = await Daily.find({ email }, { _id: false })
    res.render('personal', { data: user })
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.updatePersonal = async (req, res) => {
  try {
    sessions = req.session
    const email = sessions.email
    const user = await User.findOne({ email: email })
    const data = new Daily({
      amount: req.body.amount,
      name: user.name,
      email: user.email,
      got: req.query.got,
      context: req.body.context,
      description: req.body.description,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    })
    await data.save()
    res.redirect('/personal')
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.apiGetName = async (req, res) => {
  try {
    const email = req.query.email
    const user = await User.findOne({
      email: email,
    })
    res.status(200).json({ name: user.name })
  } catch (err) {
    res.status(500).send(err.message)
  }
}

exports.getNameApi = async (req, res) => {
  const name = req.query.name
  const person = await User.find({
    name: new RegExp(name, 'i'),
  })
  res.send(person)
}

exports.getEmail = async (req, res) => {
  res.status(200).json({ data: req.session.email })
}

exports.updateProfile = async (req, res) => {
  try{
    const email = req.session.email;
    const update = await User.findOneAndUpdate({email:email},{
      name:req.body.name,
      email:req.body.email,
      password:req.body.password,
      mobile:req.body.mobile,
      gender:req.body.gender,
    },{new:true})
    // change session data
    req.session.email = update.email;
    req.session.Name = update.name;
		req.session.mobile = update.mobile;
    res.redirect('/profile');
  }catch(err){
    res.status(500).send(err.message)
  }
}