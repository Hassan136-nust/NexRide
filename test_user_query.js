const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://localhost:27017/nexride');
    console.log("Connected to local DB directly");

    const idStr = '6a1b21a38f0c37b0ff60f351';

    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(idStr) });

    if (!user) {
        console.log("User NOT FOUND in DB!");
    } else {
        console.log("User FOUND:", user.name, "Status:", user.partnerStatus);
    }
    process.exit();
}
test().catch(console.error);
