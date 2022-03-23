const path = require('path');
const http = require('http'); 
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder, this allows my other files to be seen
app.use(express.static(path.join(__dirname, 'public')))


const PORT = process.env.PORT || 3000;


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

