const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('Mongoose');
const Schema = mongoose.Schema;
const session = require('express-session')
const checkSignIn = require('./checksignin.js');
mongoose.connect("mongodb://localhost:27017/employeedata");
var db = mongoose.connection;
db.on("connected", function () {
	console.log("mongoose connected successfully")
});
db.on("error", function (err) {
	console.log("mongoose showing error" + err)
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.set('trust proxy', 1)
app.use(session({
	secret: 'keyboardcat',
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 7 * 24 * 3600,
		sameSite: true,
	},
	httpOnly: true,
	// 2nd change.
	secure: false,
}))

const EmpModel = mongoose.model("details", {

	employeeName: {
		type: String,
		required: true
	},
	age: {
		type: Number,
		required: true
	},
	gender: {
		type: String,
		required: true
	},
	mobile: {
		type: Number,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	address: {
		type: String
	},
	nationality: String,
	maritalstatus: String,
	hiredate: Date,
	designation: String,
	dateofbirth: Date,
	created_by:{ type: Schema.Types.ObjectId, ref: 'NewUser' }
});
var user = mongoose.model("NewUser", {
	unique_id: Number,
	username: String,
	email: String,
	password: String,
	confirmpass: String
});
app.get('/login', function (req, res, next) {
	res.render("login.ejs");
});
app.post("/login", function (req, res) {
	console.log(req.body);
	user.findOne({
		email: req.body.email
	}, function (err, data) {
		console.log(data);
		if (data) {
			if (data.password === req.body.password) {
				req.session.userid = data._id;
				console.log("login session==>", req.session.userid);
				res.redirect('/employeecreation');

			} else {
				res.send({
					"success": "incorrect password"
				});
			}
		} else {
			res.send({
				"success": "emailid not registered"
			});
		}

	});
});
app.get('/register', function (req, res, next) {
	res.render("register.ejs");
});
app.post("/register-details", async (req, res) => {
	console.log(req.body);
	var PersonInfo = req.body;
	if (!PersonInfo.userName || !PersonInfo.email || !PersonInfo.password || !PersonInfo.confirmpass) {
		res.send(PersonInfo);
	}
	user.findOne({
		email: req.body.email
	}, async (err, data) => {
		if (!data) {
			user.findOne({}, async (err, data) => {
				if (data) {
					var c;
					c = data.unique_id + 1;
				} else {
					c = 1;
				}
				var NewPerson = new user({
					unique_id: c,
					userName: PersonInfo.username,
					email: PersonInfo.email,
					password: PersonInfo.password,
					confirmpass: PersonInfo.confirmpass
				});
				await NewPerson.save(function (err) {
					if (err)
						console.log(err);
					else
						console.log("data saved successfully");
				})
				res.send({
					"success": "you are registered successfully"
				});

			}).sort({
				_id: -1
			}).limit(1);
		} else {
			res.send({
				"success": "emailid already registered"
			});
		}
	});

});
app.get("/", async (req, res) => {
	res.redirect('/login');
});



app.get("/profile", checkSignIn, async (req, res) => {
	console.log("profile==>");
	console.log(req.session.userid);
	await user.findOne({
		_id: req.session.userid
	}, function (err, data) {
		if (data) {
			console.log(data);
			res.render('profile', {
				result: data
			});
		} else {
			res.redirect('/');
		}

	});
});
app.get('/logout', checkSignIn, function (req, res, next) {
	console.log("logout");
	if (req.session) {
		req.session.destroy(function (err) {
			if (err)
				return next(err);
			else
				return res.redirect('/');
		});
	}
});


app.get('/forgetpass', function (req, res, next) {
	res.render("forgetpass.ejs");
});

app.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	user.findOne({
		email: req.body.email
	}, function (err, data) {
		console.log(data);
		if (!data) {
			res.send({
				"Success": "This Email Is not regestered!"
			});
		} else {
			// res.send({"Success":"Success!"});
			if (req.body.password === req.body.confirmpass) {
				data.password = req.body.password;
				data.confirmpass = req.body.confirmpass;
				data.save(function (err, Person) {
					if (err)
						console.log(err);
					else
						console.log('Success');
					res.send({
						"Success": "Password changed!"
					});
				});
			} else {
				res.send({
					"Success": "Password does not matched! Both Password should be same."
				});
			}
		}
	});

});



app.get("/employeecreation", checkSignIn, async (req, res) => {

	res.render('index', {
		pagecontent: 'home',
		result: null
	});

});

app.post("/employeedetails", checkSignIn, async (req, res) => {
	try {
		//console.log(result);
		req.body.created_by = req.session.userid;
		var employee = new EmpModel(req.body);
		var result = await employee.save();
		console.log(result);
		res.send('data saved successfuly');

	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
});
app.get("/employeelist", checkSignIn, async (req, res) => {
	console.log("req.session.userid from emploeelist====>", req.session.userid);
	try {
		var result = await EmpModel.find({created_by:req.session.userid}).exec();
		console.log(result);
		res.render('index', {
			pagecontent: 'main',
			result: result
		});
	} catch (error) {
		res.status(500).send(error);
	}
});
app.get("/search", checkSignIn, async (req, res) => {
	res.render('search');
});
app.get("/search/employeeData", checkSignIn, async (req, res) => {
	try {
		console.log(req.query);
		var result = await EmpModel.find({
			$or: [{
				employeeName: {
					$regex: "^" + req.query.employeeName,
					$options: 'i'
				},
				email: {
					$regex: "^" + req.query.email,
					$options: 'i'
				},
			}]
		}).limit(5).exec();
		//age: { $gt: req.query.greater, $lt: req.query.lesser}
		console.log(result);
		res.render('index', {
			pagecontent: 'main',
			result: result
		});
	} catch (error) {
		res.status(500).send(error);
	}
});

app.get("/deletion/:id", checkSignIn, async (req, res) => {
	try {

		var result = await EmpModel.findByIdAndRemove(req.params.id).exec();
		res.redirect('/employeelist');
	} catch (error) {
		res.status(500).send(error);
	}
});
app.get("/employeeupdate/:id", checkSignIn, async (req, res) => {
	var result = await EmpModel.findById(req.params.id).exec();
	res.render('update', {
		result: result
	});
});

app.post("/employeeupdate/:id", checkSignIn, async (req, res) => {
	try {
		console.log(req.body);
		var result = await EmpModel.findByIdAndUpdate(req.params.id, req.body).exec();
		console.log(result);
		res.redirect('/employeeupdate/' + result._id);
	} catch (error) {
		res.status(500).send(error);
	}
});

app.listen(3000, function () {
	console.log('Express app listening on port 3000');
});
module.exports = "app";