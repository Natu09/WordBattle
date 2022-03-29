// Everything regarding user handling will be in this file 

// list of users
const users = [];

function joinRoom(id, username, room) {
    const user = {id, username, room};

    users.push(user);

    return user;
}

function getCurrentUser(id) {
    // Find and return the user with the matching id (if that user exists)
    return users.find(user => user.id == id);
}

function leaveRoom(id) {
    // Find the index of the user in users
    const index = users.findIndex(user => user.id == id);

    // If the user exists in the list of users
    if (index !== -1) {
        // Remove the users from the list and return the removed user
        return users.splice(index, 1)[0];
    }
}

// Get a list of all current users
function getUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    joinRoom,
    getCurrentUser,
    leaveRoom,
    getUsers
};