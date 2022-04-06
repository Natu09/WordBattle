// helper file for users
const users = [];

const userSet = new Set();
const roomSet = new Set();

randomNames = [
    "Cory", "Nichols",
    "Athena", "Mcknight",
    "Reese", "Davidson",
    "Caitlyn", "Reiner",
    "Braedon", "Nunez",
    "Demarcus", "Richmond",
    "Clayton", "Stuart",
    "Annabel", "Salas",
    "Colby", "Blankenship",
    "Katelynn", "Lynn",
    "Everett", "Lara",
    "Kamora", "Watson"
]

// check users for valid name and room
function loginCheck(username, room) {
    // if no user name is entered then assign a random one
    while (username.trim().length == 0) {
      const random = Math.floor(Math.random() * randomNames.length);
      if (!userSet.has(randomNames[random])) {
        username = randomNames[random]
        break
      }
    }
  
    resp = checkSets(username, room)
  
    const newUser = { username, room, resp };
    return newUser;
}

function checkSets(username, room) {
    let resp = ''
    if (userSet.has(username) && roomSet.has(room)) {
        resp = 'This username and room has already been selected'
    } else if (userSet.has(username)) {
        resp = 'This username has already been selected'
    } else if (room.trim().length == 0) {
        resp = 'Room name can not be blank'
    }
    // else if (roomSet.has(room)) {
    //      resp = 'This room name has already been selected'
    // } 
    return resp
}

  // Join user to game room
function userJoin(id, username, room, wins) {
    const user = { id, username, room, wins };
  
    users.push(user);
    userSet.add(username); // add the name to the taken username set
  
    return user;
  }
  
// Get current user by it's id
function getCurrentUser(id) {
    const user = users.find(user => user.id === id);
    console.log("logging user here ---> ", user)
    return users.find(user => user.id === id);
}

// get user who leaves game room
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        const user = users[index]
        userSet.delete(user.username)
        return users.splice(index, 1)[0];
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    loginCheck
};