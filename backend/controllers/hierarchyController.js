const User = require('../models/User');
const { getDescendantIds, wouldCreateCycle } = require('../utils/hierarchyTree');
const { isAdminTier } = require('../middleware/hierarchyAccess');

// Reusable — every hierarchy endpoint requires an approved room, same
// pattern as taskController/settingsController.
const requireApprovedRoom = (req, res) => {
  if (!req.user.roomId || req.user.roomStatus !== 'approved') {
    res.status(403).json({ message: 'You must be part of an approved room to view the hierarchy.' });
    return false;
  }
  return true;
};

// Live-refresh everyone else looking at the chart right now. All sockets
// already join `room-${roomId}` on connect (see server.js), so this is a
// single fan-out, not a per-user notification.
const broadcastHierarchyUpdate = (req) => {
  if (req.io && req.user.roomId) {
    req.io.to(`room-${req.user.roomId}`).emit('hierarchy-updated');
  }
};

// GET /api/hierarchy — every approved member of the room as a node.
exports.getHierarchy = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    const nodes = await User.find({
      roomId: req.user.roomId,
      roomStatus: 'approved',
    }).select('_id name role designation hierarchyParent hierarchyPosition');

    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/hierarchy/:userId/position — persist a dragged node's coordinates.
exports.updateNodePosition = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    const { x, y } = req.body;
    if (typeof x !== 'number' || typeof y !== 'number') {
      return res.status(400).json({ message: 'x and y must both be numbers.' });
    }

    const node = await User.findOneAndUpdate(
      { _id: req.params.userId, roomId: req.user.roomId, roomStatus: 'approved' },
      { hierarchyPosition: { x, y } },
      { new: true }
    ).select('_id name role designation hierarchyParent hierarchyPosition');

    if (!node) {
      return res.status(404).json({ message: 'Node not found in your room.' });
    }

    broadcastHierarchyUpdate(req);
    res.json(node);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/hierarchy/connections — { parentId, childId }
// Attaches childId under parentId. childId must currently be independent
// (no parent) — re-parenting an already-connected node isn't supported by
// this endpoint on purpose; detach first, then reconnect.
exports.createConnection = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    const { parentId, childId } = req.body;
    if (!parentId || !childId) {
      return res.status(400).json({ message: 'parentId and childId are required.' });
    }
    if (parentId === childId) {
      return res.status(400).json({ message: 'A node cannot be connected to itself.' });
    }

    const [parentNode, childNode] = await Promise.all([
      User.findOne({ _id: parentId, roomId: req.user.roomId, roomStatus: 'approved' }),
      User.findOne({ _id: childId, roomId: req.user.roomId, roomStatus: 'approved' }),
    ]);

    if (!parentNode || !childNode) {
      return res.status(404).json({ message: 'Both nodes must be approved members of your room.' });
    }

    // Admin/CEO nodes are always a root — they can never become a child.
    if (isAdminTier(childNode)) {
      return res.status(400).json({ message: 'An Admin cannot be placed under another node.' });
    }

    // Only a real Admin/CEO — not a delegated EDIT_HIERARCHY editor — can
    // attach someone directly under the Admin node.
    if (isAdminTier(parentNode) && !isAdminTier(req.user)) {
      return res.status(403).json({ message: 'Only an Admin can create a connection to the Admin node.' });
    }

    // Must select an independent node as the child — this is the flow
    // described in the UI ("select the parent, then select an independent
    // node"), enforced here too since the client can't be trusted alone.
    if (childNode.hierarchyParent) {
      return res.status(400).json({ message: 'That node already has a connection. Detach it first.' });
    }

    if (await wouldCreateCycle(req.user.roomId, childId, parentId)) {
      return res.status(400).json({ message: 'That would create a circular connection.' });
    }

    childNode.hierarchyParent = parentId;
    await childNode.save();

    broadcastHierarchyUpdate(req);
    res.status(201).json({
      _id: childNode._id,
      name: childNode.name,
      role: childNode.role,
      designation: childNode.designation,
      hierarchyParent: childNode.hierarchyParent,
      hierarchyPosition: childNode.hierarchyPosition,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/hierarchy/connections/:childId/detach — "Edit connection".
// Removes only this one edge. Whatever is connected below childId (its own
// children, grandchildren, etc.) is left completely untouched — childId
// just becomes the new independent root of that remaining sub-tree.
exports.detachConnection = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    const childNode = await User.findOne({
      _id: req.params.childId,
      roomId: req.user.roomId,
      roomStatus: 'approved',
    });

    if (!childNode) {
      return res.status(404).json({ message: 'Node not found in your room.' });
    }
    if (!childNode.hierarchyParent) {
      return res.status(400).json({ message: 'This node has no connection to remove.' });
    }

    const parentNode = await User.findById(childNode.hierarchyParent);
    if (parentNode && isAdminTier(parentNode) && !isAdminTier(req.user)) {
      return res.status(403).json({ message: 'Only an Admin can edit a connection to the Admin node.' });
    }

    childNode.hierarchyParent = null;
    await childNode.save();

    broadcastHierarchyUpdate(req);
    res.json({ message: 'Connection removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/hierarchy/connections/:childId — "Delete connection".
// Removes this edge AND cascades all the way down: every descendant of
// childId is also disconnected from ITS parent, flattening the whole
// sub-tree into independent nodes. Nothing above childId is touched.
exports.deleteConnection = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    const childNode = await User.findOne({
      _id: req.params.childId,
      roomId: req.user.roomId,
      roomStatus: 'approved',
    });

    if (!childNode) {
      return res.status(404).json({ message: 'Node not found in your room.' });
    }
    if (!childNode.hierarchyParent) {
      return res.status(400).json({ message: 'This node has no connection to remove.' });
    }

    const parentNode = await User.findById(childNode.hierarchyParent);
    if (parentNode && isAdminTier(parentNode) && !isAdminTier(req.user)) {
      return res.status(403).json({ message: 'Only an Admin can delete a connection to the Admin node.' });
    }

    const descendantIds = await getDescendantIds(req.user.roomId, childNode._id.toString());

    childNode.hierarchyParent = null;
    await childNode.save();

    if (descendantIds.length > 0) {
      await User.updateMany(
        { _id: { $in: descendantIds } },
        { hierarchyParent: null }
      );
    }

    broadcastHierarchyUpdate(req);
    res.json({ message: 'Connection and everything below it removed.', clearedCount: descendantIds.length + 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};