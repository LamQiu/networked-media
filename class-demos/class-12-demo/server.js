// importing the express library to use it as our server
// naming conventions usually name the variable the library name
const express = require('express')

// initialize our application using express
const app = express()

// "middleware"
// this is settings that our app needs to know about our server

// allows us to access front-end with GET requests by default
// serves our front-end html that exists in the public folder
app.use(express.static("public"));
// allows us to access the body of a POST request
app.use(express.urlencoded({ extended: true }));

// ROUTES
// GET /first-server, callback function
app.get('/first-server', (request, response) => {
    // send info to the client that makes a request to /first-server
    response.send('this is my first server!')
})

// LAST
// PORT, callback function
// to start our server: node /server
app.listen(8080, () => {
    console.log('http://127.0.0.1:8080/')
})
