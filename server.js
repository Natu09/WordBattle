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

let green_count = 0;
let user_wins = {};

// Set static folder, this allows my other files to be seen
app.use(express.static(path.join(__dirname, 'public')))

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
            currentUser: user.username,
            room: user.room,
            users: getRoomUsers(user.room),
            num_of_wins: user.wins
        });
    })    

    // Listens for word guess
    socket.on('wordGuess', guess => {
        const user = getCurrentUser(socket.id)
        const feedback = check_answer(guess);
        console.log(user)
        console.log(feedback, 'feedback here')
        if (user) {
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
                console.log(user.wins)
                io.to(user.room).emit('win', user)
            }

        }
    })

    socket.on('restart', (id) => {
        const user = getCurrentUser(id)
        if(user) {
            green_count = 0;
            letterArray = [];
            // generate new word here

            io.to(user.room).emit('reset')
        } else {
            console.log("Error an unknown user tried to restart the game in room: " + user.room)
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

let letterArray = [];
var current_word = "crane";
function check_answer(guess){
    var tileArray = [];
    green_count = 0;
    letterArray = [];
    for (let i = 0; i < guess.length; i++) {
        if(current_word.includes(guess[i])){
            if(current_word[i]===guess[i]){
                tileArray[i]="green";
                green_count++;
            }else{
                tileArray[i]="yellow";
            }
        }else{
            tileArray[i]="#484848"; // light gray
        }
        letterArray[i] = guess[i];
    }
    return tileArray;
}

const PORT = process.env.PORT || 3000;


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
