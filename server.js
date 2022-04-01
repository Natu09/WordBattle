const path = require('path');
const http = require('http'); 
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder, this allows my other files to be seen
app.use(express.static(path.join(__dirname, 'public')))

var current_users=[];
var current_word = "crane";

let letterArray = [];

io.on('connection', (socket) => {
    socket.on('submit guess', (guess) => {
        var feedback = check_answer(guess);
        socket.emit('feedback', feedback, letterArray);
    });
});

function check_answer(guess){
    var tileArray = [];
    letterArray = [];
    for (let i = 0; i < guess.length; i++) {
        if(current_word.includes(guess[i])){
            if(current_word[i]===guess[i]){
                tileArray[i]="green";
            }else{
                tileArray[i]="yellow";
            }
        }else{
            tileArray[i]="#484848";
        }
        letterArray[i]=guess[i];
    }
    return tileArray;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

