var express = require('express');
var passport=require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
 console.log("Tên req",req.user);
  if(req.user!=undefined){
    user_name_global=req.user.local.user_name;
  }

  res.render('index',{
    message1:req.flash('loginMessage'),
    message2:req.flash('signupMessage'),
    type:null,
    id:null,
    user_name:null,
  });
});


router.get('/app', function(req, res, next) {
  if(req.user!=undefined){
    user_name_global=req.user.local.user_name;
  } else {
    user_name_global = "guest";
  }
  console.log("user_name_global",user_name_global);
  res.render('index_guest',{user_name_global: user_name_global});
});

router.get('/app/:type', function(req, res, next) {
   if(req.user!=undefined){
    user_name_global=req.user.local.user_name;
  } else {
    user_name_global = "guest";
  }
  console.log("user_name_global",user_name_global);
  res.render('index_guest', { user_name_global: user_name_global });
});



router.get('/app/:type/:id',function(req, res, next) {
   if(req.user!=undefined){
    user_name_global=req.user.local.user_name;
  } else {
    user_name_global = "guest";
  }
  console.log("user_name_global",user_name_global);
  res.render('index_guest',{
    type:req.params.type,
    id:req.query.id,
    message1:req.flash('loginMessage'),
    message2:req.flash('signupMessage'),
    user_name:user_name_global
  });
});

module.exports = router;
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

function isLoggedIn2(req,res,next){
  console.log("tham so 2",req.query.id);
  console.log("type 2",req.params.type);
  if(req.isAuthenticated()){
    // login=true;
    return next();
  }
  res.render('index',{
    type:req.params.type,
    id:req.query.id,
    user_name:null,
  });
}
