const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String },
  lastActive: { type: Date },
  isOnline: { type: Boolean },
  socketId: { type: String }

})
module.exports = mongoose.model('User', userSchema);