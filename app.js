var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var flash = require('connect-flash');
var session = require('express-session');

var os = require('os');

var userIds = {};
var rooms = {};

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

var routes = require('./routes/index');
var users = require('./routes/users');

var port = process.env.PORT || 3000;

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var flash = require('connect-flash');
var session = require('express-session');


require('./config/passport')(passport);

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/app/video', express.static(path.join(__dirname, 'public')));
app.use('/app/chat', express.static(path.join(__dirname, 'public')));

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/app', express.static(path.join(__dirname, 'app')));
// app.use('/tvv', express.static(path.join(__dirname, 'tvv')));

app.use(session({ secret: 'shhsecret' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// var io = socketIO.listen(app);
io.sockets.on('connection', function(socket) {

    // convenience function to log server messages on the client
    var currentRoom, id;
    var person;
    var user_name;
    socket.on('init', function (data, callback) {
        currentRoom = (data || {}).room || randomToken();
        
        if(data != null){
            user_name = data.user_name;
        }

        var room = rooms[currentRoom];
        if(!data || !data.room){
            person = {id:socket.id, sock:socket};
            rooms[currentRoom] = [person];
            userIds[currentRoom] = 0;
            id = socket.id;
            callback(currentRoom, id);
            console.log('Room created, with #', currentRoom, 'with #id = ',socket.id);
        }else{
            // console.log("234324523424123456789034567890", data);
            if(!room){
                return;
            }
            console.log('Num connects to room before add is', room.length);
            userIds[currentRoom] = room.length;
            id = socket.id;
            callback(currentRoom, id);
            room.forEach(function (person) {
                person.sock.emit('peer.connected', { id: id , user_name:user_name});
            });
            person = {id:socket.id, sock:socket};
            room.push(person);
            console.log('Peer connected to room', currentRoom, 'with #id', socket.id);
            console.log('Num connects to room is', room.length);
        }
    });

    socket.on('message', function (data) {
        // var to = parseInt(data.to, 10)
        if (rooms[currentRoom]) {
            var i;
            var position = getPositionSocket(data.to, 'id');
            if(position !== -1){
                rooms[currentRoom][position].sock.emit('message', data);
                console.log('message from user_name',data.user_name, data.type);
                console.log('Redirecting message to', data.to, 'by', data.by);
            }
        } else {
            console.warn('Invalid user');
        }
    });

    socket.on('leaved', function (data) {
        if (!currentRoom || !rooms[currentRoom]) {
            return;
        }
        console.log('peer leaved');
        rooms[currentRoom].forEach(function (person) {
            if (person) {
                person.sock.emit('peer.disconnected', {id: id, user_name:user_name});
            }
        });
        console.log(rooms[currentRoom].length);
    });

    socket.on('disconnect', function () {
        if (!currentRoom || !rooms[currentRoom]) {
            return;
        }
        console.log('peer disconnected');
        var position = getPositionSocket(socket, 'sock');
        rooms[currentRoom].splice(position,1);
        rooms[currentRoom].forEach(function (person) {
            if (person) {
                person.sock.emit('peer.disconnected', {id: id, user_name:user_name});
            }
        });
        console.log(rooms[currentRoom].length);
    });
    function getPositionSocket(element, typeElement) {
        var i,person;
        if(typeElement == 'id'){
            for(i=0; i < rooms[currentRoom].length; i++){
                person = rooms[currentRoom][i];
                if(person.id == element){
                    return i;
                }
            }
        }else if(typeElement == 'sock'){
            for(i=0; i < rooms[currentRoom].length; i++){
                person = rooms[currentRoom][i];
                if(person.sock == element){
                    return i;
                }
            }
        }
        return -1;
    }
    function randomToken() {
        return Math.floor((1 + Math.random()) * 1E16).toString(16).substring(1);
    }

});

server.listen(port,function(){
  console.log(port);
});
module.exports = app;
