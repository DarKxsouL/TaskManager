// // server.js — must be the FIRST two lines
// const dns = require('dns');
// dns.setServers(['8.8.8.8', '1.1.1.1']);


// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const http = require('http'); 
// const { Server } = require('socket.io');
// const cookieParser = require('cookie-parser');
// const settingsRoutes = require('./routes/settings');
// const roomRoutes = require('./routes/rooms');

// const authRoutes = require('./routes/auth');

// const app = express();
// app.set('trust proxy', 1);
// const server = http.createServer(app);

// // const CLIENT_URL = process.env.CLIENT_URL
//  const CLIENT_URL = (process.env.CLIENT_URL || "").split(",");

// //Initialize Socket.io
// const io = new Server(server, {
//   cors: {
//     origin: CLIENT_URL,
//     methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
//     credentials: true
//   }
// });

// // Middleware
// app.use(cors({
//   origin: CLIENT_URL,
//   credentials: true
// }));
// app.use(express.json());

// app.use(cookieParser());

// app.use((req, res, next) => {
//     req.io = io;
//     next();
// });


// // Database Connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log('MongoDB Connection Error:', err));

// io.on('connection', (socket) => {
//     console.log(`Client connected: ${socket.id}`);
//     socket.on('disconnect', () => {
//       console.log('Client disconnected');
//     });
// });

// // Routes
// const taskRoutes = require('./routes/tasks');
// const userRoutes = require('./routes/users');

// app.use('/api/auth', authRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/settings', settingsRoutes);
// app.use('/api/rooms', roomRoutes);

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// server.js — must be the FIRST two lines
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);


require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const settingsRoutes = require('./routes/settings');
const roomRoutes = require('./routes/rooms');
const notificationRoutes = require('./routes/notifications');

const authRoutes = require('./routes/auth');

const { socketAuth } = require('./utils/socketAuth');
const { startDueDateCron } = require('./utils/dueDateCron');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// const CLIENT_URL = process.env.CLIENT_URL
 const CLIENT_URL = (process.env.CLIENT_URL || "").split(",");

//Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());

app.use(cookieParser());

app.use((req, res, next) => {
    req.io = io;
    next();
});


// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    startDueDateCron(io); // daily TASK_DUE_TODAY / TASK_OVERDUE notification sweep
  })
  .catch(err => console.log('MongoDB Connection Error:', err));

// Every socket must present a valid session (cookie or bearer token) before
// the connection is accepted — this is what makes targeted notifications
// (io.to(userId)) actually targeted instead of just a uniquely-named
// broadcast that only the intended listener happens to react to.
io.use(socketAuth);

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id} (user ${socket.userId})`);

    // Personal room — lets the backend push a notification straight to this
    // user with io.to(userId).emit(...) regardless of how many tabs/devices
    // they have open.
    socket.join(socket.userId);

    // Room-wide channel, for future features that want to broadcast to
    // everyone in a company/team at once without enumerating user IDs.
    if (socket.roomId) {
      socket.join(`room-${socket.roomId}`);
    }

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
});

// Routes
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));