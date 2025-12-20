const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // We use a fixed ID or single document pattern for global settings
  identifier: { type: String, default: 'global_settings', unique: true },
  roles: [{ type: String }],
  designations: [{ 
    name: String, 
      role: String
   }]
});

module.exports = mongoose.model('Settings', SettingsSchema);