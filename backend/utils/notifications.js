const Notification = require('../models/Notification');

// Central place that creates a Notification document AND pushes it live to
// the recipient's socket room (see server.js — every authenticated socket
// joins a room named after its own userId on connect). If the recipient
// isn't connected right now, the emit is just a no-op — the notification is
// still sitting in the DB for them to see next time they open the bell.
const notifyUser = async (io, { recipient, roomId = null, type, message, link = null, relatedId = null }) => {
  if (!recipient) return null;

  const notification = await Notification.create({
    recipient,
    roomId,
    type,
    message,
    link,
    relatedId,
  });

  if (io) {
    io.to(recipient.toString()).emit('notification', notification);
  }

  return notification;
};

// Fan the same notification out to several recipients at once (e.g. every
// admin in a room). One recipient failing shouldn't block the others.
const notifyUsers = async (io, recipientIds, payload) => {
  const uniqueIds = [...new Set((recipientIds || []).filter(Boolean).map((id) => id.toString()))];

  return Promise.all(
    uniqueIds.map((id) =>
      notifyUser(io, { ...payload, recipient: id }).catch((err) => {
        console.error('notifyUsers: failed for recipient', id, err.message);
        return null;
      })
    )
  );
};

module.exports = { notifyUser, notifyUsers };