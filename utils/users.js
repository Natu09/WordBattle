// helper file for users
const users = [];

const userSet = new Set();

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

  // Join user to game room
function userJoin(id, username, room) {
    const user = { id, username, room };
  
    users.push(user);
    userSet.add(username); // add the name to the taken username set
  
    return user;
  }
  
// Get current user by it's id
function getCurrentUser(id) {
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
getRoomUsers
};