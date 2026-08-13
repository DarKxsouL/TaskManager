// const Settings = require('../models/Settings');

// const getSettingsDoc = async () => {
//     let settings = await Settings.findOne({ identifier: 'global_settings' });
//     if (!settings) {
//         settings = await Settings.create({ identifier: 'global_settings', roles: [], designations: [] });
//     }
//     return settings;
// };

// // Helper to Clean Data (Fixes the Schema Error)
// const cleanSettings = (settings) => {
//     // Filter out any "old strings" that might be in the designations array
//     // Only keep objects that have a 'name' property
//     if (settings.designations && settings.designations.length > 0) {
//         settings.designations = settings.designations.filter(d => 
//             typeof d === 'object' && d !== null && d.name
//         );
//     }
//     return settings;
// };

// exports.getOptions = async (req, res) => {
//     try {
//         let settings = await getSettingsDoc();
//         res.json(settings);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// exports.addJobRole = async (req, res) => {
//     try {
//         const { role } = req.body;
//         if (!role) return res.status(400).json({ message: "Role is required" });

//         let settings = await getSettingsDoc();
//         settings = cleanSettings(settings); // Auto-fix bad data

//         if (!settings.roles.includes(role)) {
//             settings.roles.push(role);
//             await settings.save();
//         }
//         res.json(settings.roles);
//     } catch (err) {
//         // If auto-fix failed, force a reset of designations to allow recovery
//         if (err.message.includes('designations')) {
//             let s = await getSettingsDoc();
//             s.designations = []; // Nuclear option: clear designations to save roles
//             s.roles.push(req.body.role);
//             await s.save();
//             return res.json(s.roles);
//         }
//         res.status(500).json({ message: err.message });
//     }
// };

// exports.addDesignation = async (req, res) => {
//     try {
//         const { designation, role } = req.body;
//         if (!designation || !role) return res.status(400).json({ message: "Designation and Role are required" });

//         let settings = await getSettingsDoc();
//         settings = cleanSettings(settings); // Auto-fix bad data

//         // Check for duplicates (Name + Role)
//         const exists = settings.designations.find(d => d.name === designation && d.role === role);
//         if (!exists) {
//             settings.designations.push({ name: designation, role: role });
//             await settings.save();
//         }
//         res.json(settings.designations);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// exports.deleteJobRole = async (req, res) => {
//     try {
//         const { role } = req.body;
//         let settings = await getSettingsDoc();
//         settings = cleanSettings(settings);

//         settings.roles = settings.roles.filter(r => r !== role);
//         // Also remove designations linked to this role
//         settings.designations = settings.designations.filter(d => d.role !== role);

//         await settings.save();
//         res.json(settings);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// exports.deleteDesignation = async (req, res) => {
//     try {
//         const { designation, role } = req.body;
//         let settings = await getSettingsDoc();
//         settings = cleanSettings(settings);

//         settings.designations = settings.designations.filter(d => !(d.name === designation && d.role === role));
        
//         await settings.save();
//         res.json(settings);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };



const Settings = require('../models/Settings');

// Gets or creates settings document for the current room
const getSettingsDoc = async (roomId) => {
  let settings = await Settings.findOne({ roomId });
  if (!settings) {
    settings = await Settings.create({ 
      roomId,                        // ← scoped to room
      roles: [], 
      designations: [] 
    });
  }
  return settings;
};

// Filter out any malformed designation entries
const cleanSettings = (settings) => {
  if (settings.designations && settings.designations.length > 0) {
    settings.designations = settings.designations.filter(d =>
      typeof d === 'object' && d !== null && d.name
    );
  }
  return settings;
};

// Guard — only approved room members can touch settings
const requireApprovedRoom = (req, res) => {
  if (!req.user.roomId || req.user.roomStatus !== 'approved') {
    res.status(403).json({ message: 'You must be in an approved room to access settings.' });
    return false;
  }
  return true;
};

// Guard — only admins can mutate settings
const requireAdmin = (req, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
    res.status(403).json({ message: 'Only admins can modify settings.' });
    return false;
  }
  return true;
};

exports.getOptions = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    const settings = await getSettingsDoc(req.user.roomId);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addJobRole = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;
    if (!requireAdmin(req, res)) return;

    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });

    let settings = await getSettingsDoc(req.user.roomId);
    settings = cleanSettings(settings);

    if (!settings.roles.includes(role)) {
      settings.roles.push(role);
      await settings.save();
    }

    res.json(settings.roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addDesignation = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;
    if (!requireAdmin(req, res)) return;

    const { designation, role } = req.body;
    if (!designation || !role) {
      return res.status(400).json({ message: 'Designation and role are required' });
    }

    let settings = await getSettingsDoc(req.user.roomId);
    settings = cleanSettings(settings);

    const exists = settings.designations.find(
      d => d.name === designation && d.role === role
    );
    if (!exists) {
      settings.designations.push({ name: designation, role });
      await settings.save();
    }

    res.json(settings.designations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteJobRole = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;
    if (!requireAdmin(req, res)) return;

    const { role } = req.body;

    let settings = await getSettingsDoc(req.user.roomId);
    settings = cleanSettings(settings);

    settings.roles = settings.roles.filter(r => r !== role);
    settings.designations = settings.designations.filter(d => d.role !== role);

    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDesignation = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;
    if (!requireAdmin(req, res)) return;

    const { designation, role } = req.body;

    let settings = await getSettingsDoc(req.user.roomId);
    settings = cleanSettings(settings);

    settings.designations = settings.designations.filter(
      d => !(d.name === designation && d.role === role)
    );

    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};