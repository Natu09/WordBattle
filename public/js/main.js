var socket = io();
const keys = document.querySelectorAll(".keyboard-row button");
var index = 1;
var current_word = "";
var userList = document.getElementById('users')
var items = userList.getElementsByTagName("li");

// will switch to a better method of joining the room later
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Join this user to the chatroom
socket.emit('join', ({ username, room }));


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

// Display the list of users sent from the server
socket.on('users', ({ users }) => {
  displayUsers(users);
});

// Displays list of active users
function displayUsers(users) {
  userList.innerHTML = `${users.map(user => `<li id = "example">${user.username}</li>`).join('')}`;
}