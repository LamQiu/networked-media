// this is building off of class-19-demo
// the only difference is adding njk
const express = require('express');
const nunjucks = require('nunjucks');
let nedb = require('@seald-io/nedb');

const app = express();
let database = new nedb({ 
	filename: 'mydatabase.db', 
	autoload: true 
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
nunjucks.configure('views', {
	autoescape: true,
	express: app,
});
app.set('view engine', 'njk');

// to change form URL
// change route to whatever you want
// route currently is '/'
app.get('/', (req, res) => {
	res.render('form.njk');
});

app.post('/add-data', (req, res) => {
	let dataToBeAdded = {
		text: req.body.text,
		user: req.body.user,
		age: req.body.age,
		url: req.body.url,
		timestamp: Date.now().toLocaleDateString(),
	};

	database.insert(dataToBeAdded, (error, newData) => {
		if (error) {
			console.log(error);
			res.send('error, data was not added');
		} else {
			console.log(newData);
			res.send('data added successfully');
		}
	});
});

app.get('/get-data', (request, response) => {
	let query = {};
	database.find(query, (error, retrievedData) => {
		console.log(retrievedData);
		response.json(retrievedData);
	});
});

app.listen(6004, () => {
	console.log('http://localhost:6003');
});
