const path = require('path');
const http = require('http'); 
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const { joinRoom, getCurrentUser, leaveRoom, getUsers } = require('./utils/users');

// Set static folder, this allows my other files to be seen
app.use(express.static(path.join(__dirname, 'public')))

var current_users=[];
var current_word = "crane";

// for now a list of room codes to join
const roomCodes = ['aa', 'bb', 'cc', 'dd', 'ee'];
// for now a list of random nicknames
const usernames = ['guest1', 'guest2', 'guest3', 'guest4', 'guest5', 'guest6', 'guest7', 'guest8', 'guest9', 
'guest10', 'guest11'];

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
        console.log("here1");
        const user = joinRoom(socket.id, username, room);

        socket.join(user.room);

        io.to(user.room).emit('users', {
            users: getUsers(user.room) 
        });
    });

    socket.on('submit guess', (guess) => {
        var feedback = check_answer(guess);
        socket.emit('feedback', feedback);
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

function check_answer(guess){
    var tileArray = [];
    for (let i = 0; i < guess.length; i++) {
        if(current_word.includes(guess[i])){
            if(current_word[i]===guess[i]){
                tileArray[i]="green";
            }else{
                tileArray[i]="yellow";
            }
        }else{
            tileArray[i]="grey";
        }
    }
    return tileArray;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

