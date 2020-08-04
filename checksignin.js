const checkSignIn = function(req, res, next ){
    if(req.session.userid){
        next();     //If session exists, proceed to page 
    } else {
		res.redirect('/login');
        //next(err);  //Error, trying to access unauthorized page!
    }
};
module.exports = checkSignIn;