
var express = require('express');
var path = require('path');
var logger = require('morgan');
const e = require('express');
var app = express();



const session = require('express-session');
var bodyParser = require('body-parser')


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(session({
  secret: 'secret-key',
  name: 'UniqueSessionID',
  saveUninitialized: true,
  resave: true

}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//module.exports = app;

app.get('/', function(req,res){
  res.render('login');
});



var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://127.0.0.1" , function (err , client){
  if(err) throw err;
  var db = client.db('myDB'); 

}); 


if(process.env.PORT){
  app.listen(process.env.PORT , function(){console.log('Server started')});
}
else {
  app.listen(3000 , function(){console.log('Server started on port 3000')});
  
}

const places = ["bali" ,"paris" ,"rome" ,"inca" ,"santorini" ,"annapurna"];


app.post('/register',function(req, res){
  var x = req.body.username;
  var y = req.body.password;
  var list=[];
  MongoClient.connect("mongodb://127.0.0.1" , function (err , client){
  if(err) throw err;
  var db = client.db('myDB');
  db.collection('myCollection').findOne({username: x }, (err, result) => {
    if (x =="" || y==""){
      let alert = require('alert');
      alert("Cant enter an empty username or password");
    }

    else if (result == null){

      db.collection('myCollection').insertOne({username: x , password: y , wanttogolist:list }); 
      let alert = require('alert');
      alert("Registration was successful, now please login");
      return res.redirect("/"); 
      
    }  



    else {
      let alert = require('alert');
      alert("Username already exists ");
       
    }

  }) 
  

});  


});  

var wantlist = [];
var loggedin = false;
var name = '';

app.post('/',function(req, res){  
  var x = req.body.username;
  var y = req.body.password;
  if(x == 'admin' && y=='admin'){
    console.log("Welcome back Admin!");
    req.session.loggedin=true;
    req.session.wantlist=[];
    return res.redirect("/home"); 

  }
  MongoClient.connect("mongodb://127.0.0.1" , function (err , client){
  if(err) throw err;
  var db = client.db('myDB');
  db.collection('myCollection').findOne({username: x , password: y}, (err, result) => {
    if (x =="" || y==""){
      let alert = require('alert');
      alert("Cant enter an empty username or password");
    }
    
    else if (result == null){

      let alert = require('alert');
      alert("Username or Password do not exist, if you are a new user please press register");
      
    }  
    else{
      console.log("Welcome back! " + x);
      req.session.loggedin=true;
      req.session.name=x;
      req.session.wantlist=[];
      console.log(req.session);
      db.collection('myCollection').findOne({username: x , password: y}, (err, result)=> {
        wantlist=result.wanttogolist;
      })
      
      return res.redirect("/home");  
    }

  }) 
 
 
}); 


});




app.post('/search', function(req,res){
  var search=(req.body.Search).toLowerCase();
  var result=[];

  
  for (let i=0; i<places.length ; i++){
    if (places[i].includes(search))
    result.push(places[i]);
    console.log(result);

  }
  if (result.length==0) {
    let alert = require('alert');
    alert("Destination not Found"); }

  else{
   res.render('searchresults',{result: result});
  }  

     


    

}); 




app.get('/searchresults',function(req, res){
  

  if (req.session.loggedin){
    res.render('searchresults' , {ppp: "searchresults"})  
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  }

}); 



app.get('/islands',function(req, res){
  if (req.session.loggedin){
    res.render('islands' , {ppp: "islands"})
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  }

});
app.get('/home',function(req, res){
  

  if (req.session.loggedin){
   if (req.session.wantlist.length ==0){
      req.session.wantlist=wantlist;

    }
    
    res.render('home' , {ppp: "home"})  
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  }

});


app.get('/wanttogo',function(req, res){
  
  if (req.session.loggedin){
    res.render('wanttogo',{ wantlist: req.session.wantlist  }); 
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  }

});

app.get('/registration',function(req, res){
    res.render('registration' , {ppp: "Register"})  

});

app.get('/paris',function(req, res){
  
  if (req.session.loggedin){
    res.render('paris' , {ppp: "paris"})
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  }

});


app.post('/paris',function(req,res){
  for(i=0; i<req.session.wantlist.length ; i++){
    if(req.session.wantlist[i] == 'Paris'){
     let alert = require('alert');   
     alert("Paris is already in your list");
     return res.redirect('/home');

    }
  }

  req.session.wantlist.push('Paris');

  MongoClient.connect("mongodb://127.0.0.1" , function (err , client){
  if(err) throw err;
  var db = client.db('myDB'); 
  db.collection('myCollection').updateOne({username:req.session.name} ,{$set: {wanttogolist:req.session.wantlist}}, function(err, res){
    if (err) throw err;
    console.log("1 document updated");
  });

});


  let alert = require('alert');
  alert("Paris got added to your list!");
  return res.redirect('home')


});


app.get('/rome',function(req, res){
   

  if (req.session.loggedin){
    res.render('rome' , {ppp: "rome"}) 
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  }

});

app.post('/rome',function(req,res){
  for(i=0; i<req.session.wantlist.length ; i++){
    if(req.session.wantlist[i] == 'Rome'){
     let alert = require('alert');
     alert("Rome is already in your list");
     return res.redirect('/home');

    }
  }

  req.session.wantlist.push('Rome');
  console.log(req.session.wantlist);

  MongoClient.connect("mongodb://127.0.0.1" , function (err , client){
  if(err) throw err;
  var db = client.db('myDB'); 
  db.collection('myCollection').updateOne({username:req.session.name} ,{$set: {wanttogolist:req.session.wantlist}}, function(err, res){
    if (err) throw err;
    console.log("1 document updated");
  });

});


  let alert = require('alert');
  alert("Rome got added to your list!");
  return res.redirect('home')


});



app.get('/santorini',function(req, res){
  
  if (req.session.loggedin){
    res.render('santorini' , {ppp: "santorini"})  
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  }

});

app.post('/santorini',function(req,res){
  for(i=0; i<req.session.wantlist.length ; i++){
    if(req.session.wantlist[i] == 'Santorini'){
     let alert = require('alert');
     alert("Santorini is already in your list");
     return res.redirect('/home');

    }
  }

  req.session.wantlist.push('Santorini');
  console.log(req.session.wantlist);

  MongoClient.connect("mongodb://127.0.0.1" , function (err , client){
  if(err) throw err;
  var db = client.db('myDB'); 
  db.collection('myCollection').updateOne({username:req.session.name} ,{$set: {wanttogolist:req.session.wantlist}}, function(err, res){
    if (err) throw err;
    console.log("1 document updated");
  });

});


  let alert = require('alert');
  alert("Santorini got added to your list!");
  return res.redirect('home')


});




app.get('/bali',function(req, res){

  if (req.session.loggedin){
    res.render('bali' , {ppp: "bali"})  
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  }

});

app.post('/bali',function(req,res){
  for(i=0; i<req.session.wantlist.length ; i++){
    if(req.session.wantlist[i] == 'Bali'){
     let alert = require('alert');
     alert("Bali is already in your list");
     return res.redirect('/home');

    }
  }

  req.session.wantlist.push('Bali');

  MongoClient.connect("mongodb://127.0.0.1" , function (err , client){
  if(err) throw err;
  var db = client.db('myDB'); 
  db.collection('myCollection').updateOne({username:req.session.name} ,{$set: {wanttogolist:req.session.wantlist}}, function(err, res){
    if (err) throw err;
    console.log("1 document updated");
  });

});


  let alert = require('alert');
  alert("Bali got added to your list!");
  return res.redirect('home')


});




app.get('/cities',function(req, res){
  if (req.session.loggedin){
    res.render('cities' , {ppp: "cities"})  
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  } 

});

app.get('/hiking',function(req, res){
  if (req.session.loggedin){
    res.render('hiking' , {ppp: "hiking"})  
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  } 

});

app.get('/annapurna',function(req, res){
  if (req.session.loggedin){
    res.render('annapurna' , {ppp: "annapurna"})  
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  }

});

app.post('/annapurna',function(req,res){
  for(i=0; i<req.session.wantlist.length ; i++){
    if(req.session.wantlist[i] == 'Annapurna'){
     let alert = require('alert');
     alert("Annapurna is already in your list");
     return res.redirect('/home');

    }
  }

  req.session.wantlist.push('Annapurna');

  MongoClient.connect("mongodb://127.0.0.1" , function (err , client){
  if(err) throw err;
  var db = client.db('myDB'); 
  db.collection('myCollection').updateOne({username:req.session.name} ,{$set: {wanttogolist:req.session.wantlist}}, function(err, res){
    if (err) throw err;
    console.log("1 document updated");
  });

});


  let alert = require('alert');
  alert("Annapurna got added to your list!");
  return res.redirect('home')


});




app.get('/inca',function(req, res){
  if (req.session.loggedin){
    res.render('inca' , {ppp: "inca"})  
  }
  else{
    let alert = require('alert');
    alert("You have to be logged in before accessing any webpage");
    res.redirect("/");
  } 

});


app.post('/inca',function(req,res){
  for(i=0; i<req.session.wantlist.length ; i++){
    if(req.session.wantlist[i] == 'Inca'){
     let alert = require('alert');
     alert("Inca is already in your list");
     return res.redirect('/home');

    }
  }

  req.session.wantlist.push('Inca');

  MongoClient.connect("mongodb://127.0.0.1" , function (err , client){
  if(err) throw err;
  var db = client.db('myDB'); 
  db.collection('myCollection').updateOne({username:req.session.name} ,{$set: {wanttogolist:req.session.wantlist}}, function(err, res){
    if (err) throw err;
    console.log("1 document updated");
  });

});


  let alert = require('alert');
  alert("Inca got added to your list!");
  return res.redirect('home')


});

