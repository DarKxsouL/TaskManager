const User = require('../models/User');

// Every user with hierarchyParent === rootId is a direct child; walk level
// by level to collect the full subtree beneath rootId (not including
// rootId itself). Iterative BFS rather than recursive so there's no risk of
// call-stack depth issues on a deep org chart.
const getDescendantIds = async (roomId, rootId) => {
  const descendants = [];
  let currentLevelIds = [rootId];

  while (currentLevelIds.length > 0) {
    const children = await User.find({
      roomId,
      hierarchyParent: { $in: currentLevelIds },
    }).select('_id');

    if (children.length === 0) break;

    const childIds = children.map((c) => c._id.toString());
    descendants.push(...childIds);
    currentLevelIds = childIds;
  }

  return descendants;
};

// Cycle guard for creating a new connection: candidateParentId can't be
// connected as the parent of nodeId if candidateParentId is already
// somewhere in nodeId's own subtree — otherwise nodeId would end up both
// above and below candidateParentId.
const wouldCreateCycle = async (roomId, nodeId, candidateParentId) => {
  const descendantIds = await getDescendantIds(roomId, nodeId);
  return descendantIds.includes(candidateParentId.toString());
};

module.exports = { getDescendantIds, wouldCreateCycle };