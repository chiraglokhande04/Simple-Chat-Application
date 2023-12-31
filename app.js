var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const PORT = process.env.PORT || 3000 ;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const server = app.listen(PORT , ()=>{
   console.log(`Chat server on port ${PORT}`)
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//
const io = require('socket.io')(server)

io.on("connection",onConnected)

let socketsConnected = new Set()

function onConnected(socket) {
  console.log(socket.id)
  
  socketsConnected.add(socket.id)
  io.emit('clients-total', socketsConnected.size)
  
  socket.on('disconnect',()=>{
    console.log('socket disconnected', socket.id)
    socketsConnected.delete(socket.id)
    io.emit('clients-total', socketsConnected.size)

    socket.on('added',(data)=>{
      socket.broadcast.emit('addeduser',data)
    })
  })


  socket.on('message',(data)=>{
    console.log(data)
    socket.broadcast.emit('chat-msg',data)
  })
  socket.on('feedback',(data)=>{
    socket.broadcast.emit('feedbackName',data)
  })

 
}










// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
