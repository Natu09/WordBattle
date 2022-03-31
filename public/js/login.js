/* 
* This file is for socket communication from the server to the 
* login client. Here we are listening for the login form submission.
*/
const indexForm = document.getElementById('index-form');

const socket = io()

// Listens for form submission and makes sure username is not already taken
indexForm.addEventListener('submit', (e) => {
    // prevents the default submit to file behavior
    // e.preventDefault();
    
    // Get color and username
    let username = e.target.elements.username.value;
    console.log(username)

    // check with the server if the username is taken
    // socket.emit('checkValidLogin', username)

    // socket.on('loginResp', newUser => {
    //     if (newUser.resp.length == 0) {
    //         console.log('reached')
    //         e.target.elements.username.value = newUser.username
    //         indexForm.submit()
    //     }
    //     else {
    //         alert(newUser.resp)
    //     }
    // })
});