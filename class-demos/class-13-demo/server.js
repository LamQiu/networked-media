// importing the express library to use it as our server
// naming conventions usually name the variable the library name
const express = require('express');

// initialize our application using express
const app = express();

// "middleware"
// this is settings that our app needs to know about our server

// allows us to access front-end with GET requests by default
// serves our front-end html that exists in the public folder
app.use(express.static('public'));
// allows us to access the body of a POST request
app.use(express.urlencoded({ extended: true }));

// ROUTES -- all of the URL pages we want accessible
// syntax for GET: app.get(route, anonymous function)
app.get('/', (request, response) => {
    // response will contain all of the information we send back from the server to the client
    console.log("received a request at / route!")
    // we ALWAYS need to have a response, otherwise the page will continuously load
    response.send("this is <em>some</em> data!!!!!")
})
// GET /first-server, callback function
app.get('/first-server', (request, response) => {
    // send info to the client that makes a request to /first-server
    response.send('this is my first server!')
})

// LAST
// PORT, callback function
// to start our server: node server.js in terminal
app.listen(8080, () => {
    console.log('started (or restarted) the server')
    console.log('http://127.0.0.1:8080/')
})

// POST looks exactly the same and will handle the form data
app.post('/form-upload', (request, response) => {
    // console.log in server js only shows up in the terminal because it is a different console than the one in the browser
    // request.body retrieves the data from the forrm
    console.log(request.body)
    response.redirect("/")
})

// TERMINAL commands
// step 1: npm init
// initializes the environment
// we are using NODE.JS
// it creates package.json

// step 2: npm install express
// install express library
// create node_modules

// step 3: node server.js
// run server.js
