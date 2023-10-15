import mongoose from "mongoose";

export async function connectToDatabase() {

    if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
        // Mongooes Setup
        const databasename = 'StickyNotesPro';
        const user = process.env.MONGO_DB_USER;
        const password = process.env.MONOG_DB_PASS;
        const options = { useNewUrlParser: true, useUnifiedTopology: true };
        const connection = `mongodb+srv://${user}:${password}@m2kdevelopmentscluster.xval1.mongodb.net/${databasename}?retryWrites=true&w=majority`
        await mongoose.connect(connection, options);
        mongoose.Promise = global.Promise;
        console.log('Connected to MongoDB');
    } else console.log('Already MongoDB connection');
}