const express = require('express');
const multer = require('multer');
const nedb = require('@seald-io/nedb');
const nunjucks = require('nunjucks');
const cookieParser = require('cookie-parser');
// new libraries
const bcrypt = require('bcrypt');
const expressSession = require('express-session');
const nedbSession = require('nedb-promises-session-store');

const app = express();
const upload = multer({
	dest: 'public/uploads',
});
const database = new nedb({
	filename: 'database.db',
	autoload: true,
});
// adding user database
const userdb = new nedb({
	filename: "userdb.db",
	autoload: true
});

nunjucks.configure('views', {
	autoescape: true,
	express: app,
	noCache: true,
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'njk');
app.use(cookieParser());

app.get('/', (req, res) => {
	let totalVisits = 1;

	if (req.cookies.visits) {
		let convertToNumber = parseInt(req.cookies.visits);
		totalVisits = convertToNumber + 1;
	}

	res.cookie('visits', totalVisits, {
		expires: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
	});

	res.render('home.njk', { serverData: totalVisits });
});

// added rendering for the signup page
app.get('/signup', (req, res)=>{
	res.render('signup.njk')
})

app.post('/register', (req, res) =>{
	// use bcrypt to encrypt the password
	let encryptedPassword = bcrypt.hashSync(req.body.pass, 10)
	let userToBeAdded = {
		username: req.body.username,
		password: encryptedPassword
	}

	userdb.insert(userToBeAdded, (err, insertedUser)=>{
		res.redirect('/login')
	})
})

app.get('/login', (req, res)=>{
	res.render('login.njk')
})

app.post('/authenticate', (req, res)=>{
	let searchedUser = {
		username: req.body.username
	}

	userdb.findOne(searchedUser, (err, foundUser)=>{
		if(foundUser == null || err){
			res.redirect('/login?username=not-found')
		} else{
			let checkPassword = bcrypt.compareSync(req.body.pass, foundUser.password)
			if(checkPassword){
				res.redirect('/')
			} else {
				res.redirect('/login?password=invalid')
			}
		}
	})
})

app.listen(6005, () => {
	console.log(`http://localhost:6005`);
});
