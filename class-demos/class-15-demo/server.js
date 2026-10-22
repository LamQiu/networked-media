// all of the libraries that we are importing -> from 'npm install express nunjucks'
const express = require("express");
// import our templating library
const nunjucks = require("nunjucks");

// app is express server that uses express library variable
const app = express();

// app.use is middleware
// these are setting for our server that happen between when the server runs
// and when it received a request

// these are SETTINGS

// all css and front-end js will go into public folder
app.use(express.static("public"));

// express.urlencoded allows us to rocess POST requests
// if we have app.post, we NEED this line
// allows us to use request.body
app.use(express.urlencoded({ extended: true }));

// more settings to set up our njk files
/*
 * add our nunjucks settings under our middleware
 * this links our express application to the templating tool
*/
nunjucks.configure("views", {
    autoescape: true,
    express: app,
});
app.set("view engine", "njk");

// store data on our server using an array variable
let allData = []

// res.render always goes inside an app.get OR an app.post
app.get('/', (req, res) => {
    res.render('home.njk')
})

// for every new njk file, we need a new app.get
app.get('/form', (req, res) => {
    res.render('form.njk')
})

// display all my data on my array
app.get('/view-all', (req, res) => {
    // optional second param in response.render: data from the server
    // it is always an object
    res.render('view-all.njk', { messagesArrayFromServer: allData })
})

// for every <form> we need an app.post
app.post('/send-message', (req, res) => {
    // this action will handle:
    // 1. storing the data from the form on the server
    // console.log(req.body)
    allData.push(req.body)
    // 2. redirect to where we want the data to be displayed
    res.redirect('/view-all')

})

// ALWAYS GOES LAST
app.listen(8080, () => {
    console.log('http://localhost:8080')
})