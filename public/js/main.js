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
socket.on('roomUsers', ({ currentUser, room, users }) => {
  console.log(currentUser)
    outputRoomName(room);
    outputUsers(users, currentUser);
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

socket.on('feedback', ({user, tiles}) => {
  var tileIndex = index-4;
  current_word = "";
  counter=0;
  for(var j = tileIndex; j < tileIndex+5; ++j){
    if (user?.username === username) {
      const bigSquare = document.getElementById(`bigSquare${j}`);
      bigSquare.style = `background-color:${tiles[counter]};border-color:${tiles[counter]}`;
    }
    
    let smallSquareID = counter+1 % 5
    if (smallSquareID == 0) {
      smallSquareID = 5
    }  
    console.log(smallSquareID, `${user?.username}${smallSquareID}`, 'first')
    const smallSquare = document.getElementById(`${user?.username}${smallSquareID}`);
    smallSquare.style = `background-color:${tiles[counter]};border-color:${tiles[counter]}`;
    counter++;
  }
});

socket.on('invalid word', function(tiles) {
    cust_alert("Not a valid word!");
  });

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
      current_word = current_word.concat(letter);
    }
  };
}

function createSquares() {
  const gameBoard = document.getElementById("board");
  for (let index = 0; index < 30; index++) {
    let bigSquare = document.createElement("div");
    bigSquare.classList.add("square");
    bigSquare.setAttribute("id", `bigSquare${index+1}`);
    gameBoard.appendChild(bigSquare);
  }
  $("#alert-primary").hide();
}

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
        let grid = document.createElement("div");
        grid.classList.add('board_small');
        for (var j = 0; j < 5; ++j) {
          let smallSquare = document.createElement("div");
          smallSquare.classList.add("square_small");
          smallSquare.setAttribute("id", `${user.username}${j+1}`);
          grid.appendChild(smallSquare);
          li.appendChild(grid);
        }
    });
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
