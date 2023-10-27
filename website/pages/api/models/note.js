import mongoose from 'mongoose';

const schema = mongoose.Schema({
    user: { type: String, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
    webname: { type: String, required: true },
    folder: { type: String, default: "" },
    url: { type: String, default: "" },
    text: { type: String, default: "" },
    color: { type: String, default: "#f5f599" },
    minimized: { type: String, default: "#f5f599" },
    x: { type: Number, default: 100 },
    y: { type: Number, default: 40 },
    trellocardId: { type: String, default: "" },
    googlesheets: { type: String, default: "" },
},
    {
        timestamps: true,
    });


export default mongoose.models.Note || mongoose.model('Note', schema);