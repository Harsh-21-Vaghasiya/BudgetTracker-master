// variable declaration

var socketId = null;
var nameSender= null;
var email = null;
var lastData = 0
var first = true;
let txtBox = document.getElementById('nametxt')
let suggestion = document.getElementById('suggestion')
let ul = document.getElementById('ul')

// socket connection here...


const socket = io.connect();

socket.on('connect', () => {

  // console.log('connected');
  socketId = socket.id;
  // console.log(socketId);

})

// getting user email
let newEmail = new XMLHttpRequest();

newEmail.onload = function () {

  email = JSON.parse(this.responseText)
  // console.log(email.data)

}

newEmail.open('GET', '/api/getEmail', false)
newEmail.send();

// console.log('hello', email.data)

socket.emit('setID', email.data);

// loading data for first time
load();

function load() {

  var xhttp = new XMLHttpRequest();

  xhttp.onload = function () {

    var data = JSON.parse(xhttp.responseText);

    for (var i = lastData; i < data.data.length; i++) {

      var a = document.createElement('a');

      if (data.data[i].chatWith != data.email) {

        a.href = '/chat?to=' + data.data[i].chatWith
        nameSender = getName(data.data[i].chatWith)

      } else {
        
        a.href = '/chat?to=' + data.data[i].main
        nameSender = getName(data.data[i].main)

      }

      a.className = 'list-group-item list-group-item-action';
      a.innerHTML = nameSender;

      document.querySelector('.list-group').appendChild(a);

    }

    lastData = data.data.length;

  }

  if (lastData == 0 && first == true) {

    first = false;

    xhttp.onreadystatechange = function () {

      if (this.readyState == 1) {

        document.querySelector('.list-group').innerHTML = 'Loading...'

      } else if (this.readyState == 3) {
        
        document.querySelector('.list-group').innerHTML =
          '<a href="/personal" class="list-group-item list-group-item-action dairy">My Daily Diary</a>'

      }

    }

  }

  xhttp.open('GET', '/api/home', true);
  xhttp.send();

}

function getName(email) {

  var xhttp = new XMLHttpRequest();

  xhttp.onload = function () {

    var data = JSON.parse(xhttp.responseText);
    nameSender = data.name;

  }

  xhttp.open('GET', '/api/getname?email=' + email, false);
  xhttp.send();

  return nameSender
}

function newChatShow() {

  var x = document.querySelector('.newChat');

  if (x.classList.contains('hidden')) {

    x.classList.remove('hidden');

  } else {
    
    x.classList.add('hidden')
    x.classList.remove('visible')

  }
  
}

socket.on('connection', (data) => {

  var a = document.createElement('a');

  if (data.data.chatWith != email.data) {

    a.href = '/chat?to=' + data.data.chatWith
    nameSender = getName(data.data.chatWith);

  } else {
    
    a.href = '/chat?to=' + data.data.main
    nameSender = getName(data.data.main);
    
  }

  a.className = 'list-group-item list-group-item-action';
  a.innerHTML = nameSender;
  // console.log(a.innerHTML,nameSender);
  document.querySelector('.list-group').appendChild(a);

})

txtBox.addEventListener('input', function (event) {

  ul.innerHTML = ''
  if(txtBox.value.length == 0){
    suggestion.classList.add('hidden')
  }
  
  const xhttp = new XMLHttpRequest()
  
  xhttp.onload = function () {
  
    suggestion.classList.remove('hidden')
  
    const data = JSON.parse(this.responseText)
    if(data.length == 0){
      let li = document.createElement('li')
      li.innerHTML = 'No user found'
      ul.appendChild(li)
      let whatsapp = document.querySelector('.whatsapp');
      whatsapp.classList.remove('hidden');
    }else{
    data.forEach((element) => {
  
      let li = document.createElement('li')
  
      const name = element.name;

      if (name.includes(' ')) {
        element.name = name.replace(/\s/g, '')
      }
      let a = document.createElement('a')
      a.href = `/addChat?email=${element.email}`
      a.innerHTML = element.name
      li.appendChild(a)
      // li.innerHTML =`<a href='/addChat?email=${element.email}>${element.name}</a>`;

      ul.appendChild(li)

    })
  }

  }

  if (txtBox.value.length != 0 && !txtBox.value.includes(' ')) {
    
    xhttp.open('GET', `/api/search?name=${txtBox.value}`, true)
    xhttp.send()

  }

})

function addThis(name, email) {

  txtBox.value = name

  const email2 = document.getElementById('email')

  email2.value = email

  if (!email) {

    email2.value = 'NO EMAIL'

  }

  suggestion.classList.add('hidden')

}
