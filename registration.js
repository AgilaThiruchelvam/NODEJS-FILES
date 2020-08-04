
const regis =require(app);

app.use(function(req,res,next){
  res.locals.result = null;
  next();
})
var user = mongoose.model("NewUser", {
	unique_id: Number,
	username: String,
	email: String,
	password: String,
	confirmpass: String
});
app.get('/register', function (req, res, next) {
	res.render("register.ejs");
});
app.post("/register-details", function (req, res) {
	console.log(req.body);
	var PersonInfo = req.body;
	if (!PersonInfo.username || !PersonInfo.email || !PersonInfo.password || !PersonInfo.confirmpass) {
		res.send();
	}
		user.findOne({email: req.body.email}, function (err, data) {
			if (!data) {
				user.findOne({}, function (err, data) {
					if (data) {
						var c;
						c = data.unique_id + 1;
					}
					else {
						c = 1;
					}
					var NewPerson = new user({
						unique_id: c,
						userName: PersonInfo.username,
						email: PersonInfo.email,
						password: PersonInfo.password,
						confirmpass: PersonInfo.confirmpass
					});
					NewPerson.save(function (err) {
						if (err)
							console.log(err);
						else
							console.log("data saved successfully");
					})
					res.send({ "success": "you are registered successfully" });

				}).sort({ _id: -1 }).limit(1);
			}
			else {
				res.send({ "success": "emailid already registered"});
			}
		});

	});
	app.get('/login', function (req, res, next) {
		res.render("login.ejs");
	});
	
	app.post("/login", function (req, res) {
	console.log(req.body);
	user.findOne({email:req.body.email}, function (err, data) {
		console.log(data);
		if (data) {
			if (data.password=== req.body.password) {
				//req.session.userid = data._id;
				//console.log(req.session.userid);
				res.render('index',{pagecontent:'logintext'});
				
			}
			else {
				res.send({ "success": "incorrect password" });
			}
		}
		else {
			res.send({ "success": "emailid not registered" });
		}

	});
});

/*app.get("/profile", function (req, res) {
	console.log("profile");
	console.log(req.session);
	user.findOne({_id: req.session.userid}, function (err, data) {
		if (data) {
	
			console.log("data");
			console.log(data);
		}
		else {
			res.redirect('/');
		}

	});
});
app.get('/logout', function (req, res, next) {
	console.log("logout");
	if (req.session) {
		req.session.destroy(function (err) {
			if (err)
				return next(err);
			else
				return res.redirect('/');
		});
	}
});*/


app.get('/forgetpass', function (req, res, next) {
	res.render("forgetpass.ejs");
});

app.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;
			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

