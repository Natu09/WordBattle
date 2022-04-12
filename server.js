// inspired by: https://github.com/bradtraversy/chatcord
const path = require('path');
const http = require('http'); 
const express = require('express');
const socketio = require('socket.io');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers, 
    loginCheck
} = require('./utils/users')


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const axios = require("axios");
let green_count = 0;
let user_wins = {};

// Set static folder, this allows my other files to be seen
app.use(express.static(path.join(__dirname, 'public')))

var current_users=[];
var current_word = "coach";
let word_list = [];

var fs = require('fs');
word_list = fs.readFileSync('words.txt').toString().split("\n");
update_current_word();

// Run when a client connects 
io.on('connection', (socket) => {
    // checks username and room for availability 
    socket.on('checkValidLogin', ({ username, room }) => {
        const newUser = loginCheck(username, room)
        console.log(newUser)
        io.emit('loginResp', newUser)
    })

    // Runs when a user is successful in joining room
    socket.on('joinRoom', ({ username, room }) => {
        let wins = user_wins[username]
        if (typeof wins == 'undefined') {
            wins = 0
        }
        const user = userJoin(socket.id, username, room, wins)

        socket.join(user.room)

        // Welcomes the current user and only the current user
        socket.emit('message', 'Welcome to Word Battle')

        // Broadcast when a user connects to everyone else except the current user 
        socket.broadcast.to(user.room).emit('message', `${user.username} has joined the game`)
        // Send user/room info to show who's online when someone joins a room
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
            num_of_wins: user.wins
        });
    })    

    // Listens for word guess
    socket.on('wordGuess', guess => {
        const user = getCurrentUser(socket.id)
        checkValidWord(guess).then((message) => {
            const feedback = check_answer(guess);
            if (user) {
                user.tiles = feedback
                // send room feedback to fill out the small squares and big squares
                io.to(user.room).emit('feedback', {
                    user: user,
                    tiles: feedback,
                    letters: letterArray
                })

                if (green_count === 5) {
                    green_count = 0;
                    user.wins++;
                    user_wins[user.username] = user.wins;
                    update_current_word();
                    io.to(user.room).emit('win', user)
                }
            }
        }).catch((message) => {
            socket.emit('invalid word');
        })
    })
/*
    socket.on('submit guess', (guess) => {
        checkValidWord(guess).then((message) => {
            var feedback = check_answer(guess);
            if (check_win(feedback)) {
                /*To-Do:
                -send winner information to clients
                -tell clients to clear board
                -switch to new word (update "current_word")

            }
            socket.emit('feedback', feedback);

        }).catch((message) => {
            socket.emit('invalid word');
        })
    });
*/

    socket.on('restart', (id) => {
        const user = getCurrentUser(id)
        if(user) {
            green_count = 0;
            letterArray = [];
            // generate new word here
            // update_current_word();
            io.to(user.room).emit('reset')
        } else {
            console.log(`Error an unknown user tried to restart the game in room: ${user.room}`)
        }
    }) 
    // Runs when a client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        // Send user info to show when someone leaves
        if (user) {
            io.to(user.room).emit('message', `${user.username} has left the game`)

            // Send user/room info to show who's online when someone leaves a room
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    })
});

function check_win(guess){
    if(guess.includes("#FFFF66") || guess.includes("#484848")){
        return false;
    }else{
        return true;
    }
}

let letterArray = [];

function check_answer(guess){
    var tileArray = [];
    var wordDict = {};
    green_count = 0;
    letterArray = [];
    //create a dictionary of the current word where the keys: characters, value: character count in word
    for (let i = 0; i < current_word.length; i++) {
        wordDict[current_word[i]] = (wordDict[current_word[i]] || 0) + 1;
    }
    //loop through and find all of the correct letters in the correct location
    for (let i = 0; i < guess.length; i++) {
        if(current_word[i]==guess[i]){
            tileArray[i]="green";
            wordDict[current_word[i]] = wordDict[current_word[i]]-1;
            green_count++;
        }
    }
    //loop through and determine if there was a correct letter in the wrong location
    //eg. If the word is "erase" and the guess is "peele" it should result in the following array:
    //["Grey", "Yellow", "Grey", "Grey", "Green"], note: one of the 'e's are grey because the correct word only contains 2 'e's
    for (let i = 0; i < guess.length; i++) {
        if(current_word.includes(guess[i]) && typeof tileArray[i] === 'undefined' && wordDict[guess[i]] != 0){
            tileArray[i]="#FFFF66";
            wordDict[guess[i]] = wordDict[guess[i]]-1;
        }
        else if(typeof tileArray[i] === 'undefined'){
            tileArray[i]="#484848";
        }
        letterArray[i] = guess[i];
    }
    return tileArray;
}

function update_current_word(){
        let index = Math.floor( Math.random()*word_list.length );
        current_word = word_list[index].toLowerCase();
        word_list.splice( index, 1 );
}

const PORT = process.env.PORT || 3000;

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

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
