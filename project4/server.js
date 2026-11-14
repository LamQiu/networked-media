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

app.get('/', (req, res) => {
    res.render('home.njk')
})

app.get('/form', (req, res) => {
	res.render('form.njk');
});

app.post('/add-data', (request, response) => {
	let dataToBeAdded = {
		message: request.body.text,
		timestamp: Date.now(),
	};

	database.insert(dataToBeAdded, (error, newData) => {
		if (error) {
			console.log(error);
			response.send('error, data was not added');
		} else {
			console.log(newData);
			response.redirect('/view-all');
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

app.get('/view-all', (req, res) => {
    database.find({}, (error, retrievedData) => {
    if (error) {
      console.log(error);
      return res.send('error loading data');
    }
    res.render('view-all.njk', { messagesArrayFromServer: retrievedData });
  });
})

app.post('/clear-data', (req, res) => {
  database.remove({}, { multi: true }, (error, numRemoved) => {
    if (error) {
      console.log(error);
      return res.send('error clearing database');
    }
    console.log('removed', numRemoved);
    res.redirect('/view-all');
  });
});

app.listen(6003, () => {
	console.log('http://localhost:6003');
});
