const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authenticate socket connections using JWT
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name role verificationStatus isActive');

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 Socket connected: ${socket.user.name} (${userId})`);

    // Join user's personal room (for targeted notifications)
    socket.join(`user:${userId}`);

    // Emit confirmation
    socket.emit('connected', {
      message: 'Connected to RealState Platform',
      userId,
    });

    // Handle typing events for potential chat feature
    socket.on('typing', ({ recipientId }) => {
      socket.to(`user:${recipientId}`).emit('user-typing', {
        userId,
        name: socket.user.name,
      });
    });

    socket.on('stop-typing', ({ recipientId }) => {
      socket.to(`user:${recipientId}`).emit('user-stop-typing', { userId });
    });

    // Handle join custom room (e.g., property discussion)
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`📍 ${socket.user.name} joined room: ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.user.name} — ${reason}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

/**
 * Emit a notification to a specific user
 */
const emitNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`user:${userId.toString()}`).emit('notification', notification);
  }
};

/**
 * Emit an event to a specific room
 */
const emitToRoom = (roomId, event, data) => {
  if (io) {
    io.to(roomId).emit(event, data);
  }
};

/**
 * Get the io instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, emitNotificationToUser, emitToRoom, getIO };
