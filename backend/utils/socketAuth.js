const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Tiny cookie-header parser so socket auth doesn't need the full `cookie`
// package for one field — does the same job cookie-parser does for Express.
const parseCookies = (header) => {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  });
  return out;
};

// Socket.io connection middleware — same dual auth as authMiddleware.protect:
// the httpOnly cookie first, falling back to a Bearer-style token passed in
// the handshake's `auth.token` (needed for setups where the cross-site
// cookie doesn't reliably ride along on the socket handshake).
const socketAuth = async (socket, next) => {
  try {
    let token;

    const cookies = parseCookies(socket.handshake.headers.cookie);
    if (cookies.token) {
      token = cookies.token;
    } else if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }

    if (!token) {
      return next(new Error('Not authorized'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id roomId');

    if (!user) {
      return next(new Error('Not authorized'));
    }

    socket.userId = user._id.toString();
    socket.roomId = user.roomId;
    next();
  } catch (error) {
    next(new Error('Not authorized'));
  }
};

module.exports = { socketAuth };