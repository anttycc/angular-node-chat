const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const { config } = require('./config');
const routes = require('./route');
const UserModel = require('./models/user');
const MessageModel = require('./models/message');
const moment = require('moment');
const { validateBody, validateParams, validateQuery } = require('./middlewares/validate.middleware');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

app.use(
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 2500000,
    },
  }).fields([
    {
      name: 'file',
      maxCount: 1,
    },
    {
      name: 'image',
      maxCount: 1,
    },
  ])
);
// app.use('/', routes);
app.use('/', validateBody, validateParams, validateQuery, routes);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  console.log(error)
  res.status(statusCode).send(error);
})
const server = http.createServer(app);
server.listen(process.env.PORT || config.port);
server.on('listening', () => {
  console.log('listening on ', server.address().port);
  mongoose.connect(config.dbString, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
      console.log(err);
      process.exit(0);
    }
    console.log('DB Connected');
  });

});
server.on('error', (err) => {
  console.log('Err', err);
  process.exit(1);
})

const io = require('socket.io')(server);

const handleUserStatus = async (userId = null, status, socketId) => {
  try{
  let condition = { socketId };
  if (userId) {
    condition = { _id: userId };
  }

  await UserModel.findOneAndUpdate(condition, { $set: { isOnline: status === 'online', lastActive: moment().utc(), socketId: socketId } }, { new: true });
  const users = await UserModel.find({}, { password: 0 });
  let j = 0;
  while (j < users.length) {
    io.to(users[j].socketId).emit(status, users);
    j++;
  }
}catch(e){
  console.log(e);
  
}
}

io.on('connection', async (socket) => {
  socket.on('online', async ({ userId }) => {
    handleUserStatus(userId, 'online', socket.id)
  })
  socket.on('private-typing', async ({ senderId, toId, typingUser }) => {
    const user = await UserModel.findOne({ _id: toId }, { socketId: 1 })
    io.to(user.socketId).emit('private-typing', { senderId, toId, name: typingUser });
  });
  socket.on('private-message', async ({ senderId, receiverId, message }) => {
    try {
      const user = await UserModel.findOne({ _id: receiverId }, { socketId: 1 })
      const messageData = await MessageModel.create({
        message,
        senderId,
        receiverId,
        date: moment().utc()
      });

      io.to(user.socketId).emit('private-message', messageData);
    } catch (e) {
      console.log(e)
    }
  });
  socket.on('chat-history', async ({ senderId, receiverId }) => {
    try {
    const user = await UserModel.findOne({ _id: senderId }, { socketId: 1 });
    const history = await MessageModel.find({ $or: [{ senderId, receiverId }, { receiverId: senderId, senderId: receiverId }] });
    io.to(user.socketId).emit('chat-history', history);
    }catch(e){
      console.log(e);
    }

  })


  socket.on('disconnect', async () => {
    handleUserStatus(null, 'offline', socket.id);
  })
});

