const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const keys = document.querySelectorAll(".keyboard-row button");
const items = userList.getElementsByTagName("li");

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
socket.on('message', (message) => {
    console.log(message);
});



let index = 1;
let current_word = "";
//for-loop based on youtube video, I did the logic myself tho
//so that it's not super similar to the youtube video lol
//may want to delegate some of the logic to helper functions lol
for (let i = 0; i < keys.length; i++) {
  keys[i].onclick = ({ target }) => {
    console.log(current_word);
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
      const currentSquare = document.getElementById(index);
      currentSquare.textContent = '';
      return;
    }
    else if(current_word.length>=5){
      alert("At max word length"+current_word.length);
    }
    else{
      const currentSquare = document.getElementById(index);
      currentSquare.textContent = letter;
      current_word = current_word.concat(letter);
      index++;
    }
  };
}

//where word will be sent to server
function sendWord() {
  socket.emit('submit guess', current_word);
}

socket.on('feedback', function(tiles) {
    var tileIndex = index-5;
    counter=0;
    for(var j = tileIndex; j < tileIndex+5; ++j){
      const current_square = document.getElementById(j);
      console.log(tiles);
      current_square.style = `background-color:${tiles[counter]};border-color:${tiles[counter]}`;
      counter++;
    }
  });

//createSquares() taken from youtube video
document.addEventListener("DOMContentLoaded", () => {
  createSquares();
  createSquaresSmall();
  function createSquares() {
    const gameBoard = document.getElementById("board");
    for (let index = 0; index < 30; index++) {
      let square = document.createElement("div");
      square.classList.add("square");
      square.setAttribute("id", index + 1);
      gameBoard.appendChild(square);
    }
  }
  function createSquaresSmall() {
    for (var i = 0; i < items.length; ++i) {
      let grid = document.createElement("div");
      grid.classList.add('board_small');
      for (var j = 0; j < 5; ++j) {

        let square = document.createElement("div");
        square.classList.add("square_small");
        //square.setAttribute("id", index + 1);
        grid.appendChild(square);
        items[i].appendChild(grid);
      }
    }
  }
});

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}
  
// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}
