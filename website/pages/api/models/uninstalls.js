import mongoose from 'mongoose';

const schema = mongoose.Schema({
  gcmWeb: { type: String, default: '' },
  chromeID: { type: String, default: '' },
  email: { type: String, default: '' },
  user: { type: String, default: '' },
  count: { type: Number, default: 1 },
},
{
    timestamps: true,
});

export default mongoose.models.Uninstall || mongoose.model('Uninstall', schema);


