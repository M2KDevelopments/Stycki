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
  count:  { type: Number, default: 60 }
});

export default mongoose.models.User || mongoose.model('User', schema);


