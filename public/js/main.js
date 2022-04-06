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

socket.on('feedback', ({user}) => {
  
  var tileIndex = index-5;
  counter=0;
  for(var j = tileIndex; j < tileIndex+5; ++j){
    if (user?.username === username) {
      const bigSquare = document.getElementById(`bigSquare${j}`);
      bigSquare.style = `background-color:${user?.tiles[counter]};border-color:${user?.tiles[counter]}`;
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

//createSquares() taken from youtube video
document.addEventListener("DOMContentLoaded", () => {
  createSquares();
});

let index = 1;
let current_word = "";
//for-loop based on youtube video, I did the logic myself tho
//so that it's not super similar to the youtube video lol
//may want to delegate some of the logic to helper functions lol
for (let i = 0; i < keys.length; i++) {
  keys[i].onclick = ({ target }) => {

    // initialize the class IDs to reference later
    const bigSquareID = `bigSquare${index}`

    const letter = target.getAttribute("data-key");
    if (letter === "enter") {
      if(current_word.length<5){
        alert("Word isn't 5 letters");
      }else{
        sendWord();
        current_word = "";
      }
      return;
    }
    else if (letter === "del") {
      current_word = current_word.slice(0, -1);
      index--;
      
      const currentSquare = document.getElementById(bigSquareID);
      currentSquare.textContent = '';
      return;
    }
    else if(current_word.length>=5){
      alert("At max word length"+current_word.length);
    }
    else{
      const currentSquare = document.getElementById(bigSquareID);
      currentSquare.textContent = letter;
      current_word = current_word.concat(letter);
      index++;
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
}

// Add users to DOM
// creates the name and small square list on the side navigation
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user.username;
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

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
