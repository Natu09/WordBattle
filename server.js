const path = require('path');
const http = require('http'); 
const express = require('express');
const socketio = require('socket.io');
const { 
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users')


const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder, this allows my other files to be seen
app.use(express.static(path.join(__dirname, 'public')))

// Run when a client connects 
io.on('connection', (socket) => {
    // checks username for availability 
    // socket.on('checkValidLogin', ({ username, room }) => {
    //     const newUser = loginCheck(username, room)
    //     io.emit('loginResp', newUser)
    // })

    // Runs when a user is successful in joining room
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        // Welcomes the current user and only the current user
        socket.emit('message', 'Welcome to Word Battle')

        // Broadcast when a user connects to everyone else except the current user 
        socket.broadcast.to(user.room).emit('message', `${user.username} has joined the game`)

        // Send user/room info to show who's online when someone joins a room
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    })    

    // Listens for word guess
    socket.on('wordGuess', guess => {
        const user = getCurrentUser(socket.id)
        console.log(user, user.room)
        const feedback = check_answer(guess);
        io.to(user.room).emit('feedback', feedback)
    })


    // Runs when a client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        // Send user info to show when someone leaves
        if (user) {
            io.to(user.room).emit('message', `${user.username} has left the game`)
        }

        // Send user/room info to show who's online when someone leaves a room
        // io.to(user.room).emit('roomUsers', {
        //     room: user.room,
        //     users: getRoomUsers(user.room)
        // });
    })
});

var current_word = "crane";
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
