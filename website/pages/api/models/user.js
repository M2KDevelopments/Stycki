import mongoose from 'mongoose';

const schema = mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  email: { type: String, required: true, unique: true, match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ },
  image: { type: String },
  verified: { type: Boolean, default: false },
  verifiedDeadline: { type: Date },
  googleID: { type: String },
  referredBy: { type: String },
  referralCode: { type: String, required: true },
  password: { type: String, required: true },
  ip: { type: String },
  gcmWeb: { type: String, default: '' },
  gcmAndroid: { type: String, default: '' },
  gcmChrome: { type: String, default: '' },
  refreshToken: { type: String, default: '' },
  count:  { type: Number, default: 60 },
  integrations: { type: Boolean, default: false },

  // Integrations
  trelloAccessToken: { type: String, default: '' },
  trelloRefreshToken: { type: String, default: '' },

  notionAccessToken: { type: String, default: '' },
  notionRefreshToken: { type: String, default: '' },

  onenoteAccessToken: { type: String, default: '' },
  onenoteRefreshToken: { type: String, default: '' },

  evernoteAccessToken: { type: String, default: '' },
  evernoteRefreshToken: { type: String, default: '' },
 
  googleSheetsAccessToken: { type: String, default: '' },
  googleSheetsRefreshToken: { type: String, default: '' },
  
  googleDriveAccessToken: { type: String, default: '' },
  googleDriveRefreshToken: { type: String, default: '' },

  
});

export default mongoose.models.User || mongoose.model('User', schema);


