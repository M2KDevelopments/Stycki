import mongoose from 'mongoose';

const schema = mongoose.Schema({
    user: { type: String, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
},
    {
        timestamps: true,
    });

    
export default mongoose.models.Folder || mongoose.model('Folder', schema);