const path = require('path');
const http = require('http'); 
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const { joinRoom, getCurrentUser, leaveRoom, getUsers } = require('./utils/users');
const axios = require("axios");

// Set static folder, this allows my other files to be seen
app.use(express.static(path.join(__dirname, 'public')))

var current_users=[];
var current_word = "erase";
let word_list = [];

// for now a list of room codes to join
const roomCodes = ['aa', 'bb', 'cc', 'dd', 'ee'];
// for now a list of random nicknames
const usernames = ['guest1', 'guest2', 'guest3', 'guest4', 'guest5', 'guest6', 'guest7', 'guest8', 'guest9', 
'guest10', 'guest11'];

var fs = require('fs');
word_list = fs.readFileSync('words.txt').toString().split("\n");
console.log(word_list.length);

io.on('connection', (socket) => {
    // when a new user joins the room 
    socket.on('join', ({ username, room }) => {
        // if the user does not specify a nickname
        if (username == '') { 
            // Only use each defualt nickname once (can be improved later)
            username = usernames.shift();
        }
        if (room == '') { 
            // Only use each defualt nickname once (can be improved later)
            room = roomCodes.shift();
        }
        const user = joinRoom(socket.id, username, room);

        socket.join(user.room);

        io.to(user.room).emit('users', {
            users: getUsers(user.room) 
        });
    });

    socket.on('submit guess', (guess) => {
        checkValidWord(guess).then((message) => {
            var feedback = check_answer(guess);
            if (check_win(feedback)) {
                /*To-Do:
                -send winner information to clients
                -tell clients to clear board
                -switch to new word (update "current_word")*/

            }
            socket.emit('feedback', feedback);

        }).catch((message) => {
            socket.emit('invalid word');
        })
    });

    socket.on('disconnect', () => {
        // Removes user from list of users
        const user = leaveRoom(socket.id);
        if (user) {
            // Display the updated list of users
            io.to(user.room).emit('users', {
                users: getUsers(user.room) 
            });
        }
    });
});

function check_win(guess){
    if(guess.includes("yellow") || guess.includes("grey")){
        return false;
    }else{
        return true;
    }
}

function check_answer(guess){
    var tileArray = [];
    var wordDict = {};
    //create a dictionary of the current word where the keys: characters, value: character count in word
    for (let i = 0; i < current_word.length; i++) {
        wordDict[current_word[i]] = (wordDict[current_word[i]] || 0) + 1;
    }
    //loop through and find all of the correct letters in the correct location
    for (let i = 0; i < guess.length; i++) {
        if(current_word[i]==guess[i]){
            tileArray[i]="green";
            wordDict[current_word[i]] = wordDict[current_word[i]]-1;
        }
    }
    //loop through and determine if there was a correct letter in the wrong location
    //eg. If the word is "erase" and the guess is "peele" it should result in the following array:
    //["Grey", "Yellow", "Grey", "Grey", "Green"], note: one of the 'e's are grey because the correct word only contains 2 'e's
    for (let i = 0; i < guess.length; i++) {
        if(current_word.includes(guess[i]) && typeof tileArray[i] === 'undefined' && wordDict[guess[i]] != 0){
            tileArray[i]="yellow";
            wordDict[guess[i]] = wordDict[guess[i]]-1;
        }
        else if(typeof tileArray[i] === 'undefined'){
            tileArray[i]="grey";
        }
    }
    return tileArray;
}

function update_current_word(){
    current_word = word_list.shift().toLowerCase();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

var checkValidWord = function(word) {
    return new Promise(function (resolve, reject) {
        const axios = require("axios");
        const url = 'https://wordsapiv1.p.rapidapi.com/words/' + word;
        const options = {
            method: 'GET',
            url: url,
            headers: {
                'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com',
                'X-RapidAPI-Key': '08be4aaa3bmshba2705794fd487cp1842e4jsnd1db9e07dfb8'
            }
        };

        axios.request(options).then(function (response) {
            resolve(true);
        }).catch(function (error) {
            reject(false);
        });
    });
}
