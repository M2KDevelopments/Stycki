import mongoose from 'mongoose';

const schema = mongoose.Schema({
    gcm: { type: String, required: true },
    platform: { type: String, required: true },
},
    {
        timestamps: true,
    });

    
export default mongoose.models.Notification || mongoose.model('Notification', schema);