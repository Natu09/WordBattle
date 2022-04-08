const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const keys = document.querySelectorAll(".keyboard-row button");

// Get username and room from URL
let { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
// we can maybe add a alert or notification that a user has joined the room
socket.on('message', (message) => {
    console.log(message);
});

//where word will be sent to server
function sendWord() {
  socket.emit('wordGuess', (current_word));
}

socket.on('feedback', ({user, letters}) => {
  var tileIndex = index-4;
  current_word = "";
  counter=0;
  for(var j = tileIndex; j < tileIndex+5; ++j){
    if (user?.username === username) {
      const bigSquare = document.getElementById(`bigSquare${j}`);
      bigSquare.style = `background-color:${user?.tiles[counter]};border-color:${user?.tiles[counter]}`;
      animateCSS(bigSquare, 'flipInY')
      shadeKeyboard(letters[counter], user?.tiles[counter])
    }
    let smallSquareID = counter+1 % 5
    if (smallSquareID == 0) {
      smallSquareID = 5
    }  
    console.log(smallSquareID, `${user?.username}${smallSquareID}`, 'first')
    const smallSquare = document.getElementById(`${user?.username}${smallSquareID}`);
    smallSquare.style = `background-color:${user?.tiles[counter]};border-color:${user?.tiles[counter]}`;
    counter++;
  }
});

socket.on('invalid word', function(tiles) {
    cust_alert("Not a valid word!");
  });
socket.on('reset', () => {
  document.location.reload();
})

const closeModalButtons = document.querySelectorAll('[data-ok-button]')
const overlay = document.getElementById('overlay')

socket.on('win', (user) => {
  const modal = document.getElementById('winModal')
  const div = document.createElement('div');
  div.classList.add('modal-header')
  div.innerHTML =  `<p><strong>${user.username}</strong> has won the game</p>`
  modal.insertAdjacentElement('afterbegin' ,div)
  openModal(modal)
})

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.winModal')
    closeModal(modal);
  })
})

//createSquares() taken from youtube video
document.addEventListener("DOMContentLoaded", () => {
  createSquares();
});


let index = 0;
let current_word = "";
let indexSet = new Set([1,6,11,16,21,26]);
//for-loop based on youtube video, I did the logic myself tho
//so that it's not super similar to the youtube video lol
//may want to delegate some of the logic to helper functions lol
for (let i = 0; i < keys.length; i++) {
  keys[i].onclick = ({ target }) => {

    // initialize the class IDs to reference later
    //const bigSquareID = `bigSquare${index}`
    const letter = target.getAttribute("data-key");
    if (letter === "enter") {
      if(current_word.length<5){
        cust_alert("Word isn't 5 letters");
      }else{
        sendWord();
        //current_word = "";
      }
      return;
    }
    else if (letter === "del") {
      current_word = current_word.slice(0, -1);
      if(!indexSet.has(index)){
          if(!current_word)return;
          const currentSquare = document.getElementById(`bigSquare${index}`);
          currentSquare.textContent = '';
          index--;
      }else{
          const currentSquare = document.getElementById(`bigSquare${index}`);
          currentSquare.textContent = '';
      }
      return;
    }
    else if(current_word.length>=5){
      cust_alert("At max word length"+current_word.length);
    }
    else{
        if(!current_word && indexSet.has(index)) index--;
        index++;
        const bigSquareID = `bigSquare${index}`
      const currentSquare = document.getElementById(bigSquareID);
      currentSquare.textContent = letter;
      animateCSS(currentSquare, "pulse")
      current_word = current_word.concat(letter);
    }
  };
}

function createSquares() {
  console.log(username)
  const gameBoard = document.getElementById("board");
  for (let index = 0; index < 30; index++) {
    let bigSquare = document.createElement("div");
    bigSquare.classList.add("square");
    bigSquare.setAttribute("id", `bigSquare${index+1}`);
    gameBoard.appendChild(bigSquare);
  }
  $("#alert-primary").hide();
}

// Add users to DOM
// creates the name and small square list on the side navigation
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
      const li = document.createElement('li');
      li.innerHTML = `${user.username} &#9733; ${user.wins}`;
      userList.appendChild(li);
      let grid = document.createElement("div");
      grid.classList.add('board_small');
      const tiles = user?.tiles
      for (var j = 0; j < 5; ++j) {
        let smallSquare = document.createElement("div");
        smallSquare.classList.add("square_small");
        smallSquare.setAttribute("id", `${user?.username}${j+1}`);
        grid.appendChild(smallSquare);
        li.appendChild(grid);
        if (tiles && tiles.length > 0) {
          smallSquare.style = `background-color:${tiles[j]};border-color:${tiles[j]}`;
        }
      }
  });
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

function cust_alert(message){
    var alert = document.getElementById("alert-primary");
    alert.innerHTML = '';
    var y = document.createTextNode(message);
    alert.appendChild(y);

    $("#alert-primary").fadeTo(1000, 500).slideUp(500, function() {
      $("#alert-primary").slideUp(500);
    });
  }

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});

function shadeKeyboard(letter, color) {
  for (const elem of document.querySelectorAll(".keyboard-row button")) {
      if (elem.textContent === letter) {
          let oldColor = elem.style.backgroundColor
          if (oldColor === 'green') {
              return
          } 

          if (oldColor === '#FFFF66' && color !== 'green') {
              return
          }

          elem.style.backgroundColor = color
          break
      }
  }
}


function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')

  socket.emit('restart', socket.id)
}

// function for animation creds:https://animate.style/#javascript
const animateCSS = (element, animation, prefix = 'animate__') =>
// We create a Promise and return it
new Promise((resolve, reject) => {
  const animationName = `${prefix}${animation}`;
  // const node = document.querySelector(element);
  const node = element
  node.style.setProperty('--animate-duration', '0.3s');

  node.classList.add(`${prefix}animated`, animationName);

  // When the animation ends, we clean the classes and resolve the Promise
  function handleAnimationEnd(event) {
    event.stopPropagation();
    node.classList.remove(`${prefix}animated`, animationName);
    resolve('Animation ended');
  }

  node.addEventListener('animationend', handleAnimationEnd, {once: true});
}); 