const mongoose = require('mongoose');
const dns = require('dns');

// Override local DNS to fix querySrv ECONNREFUSED error in Node.js
if (!process.env.VERCEL) {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const connectDB = async () => {
    console.log("=== DB CONNECTION ATTEMPTING... ===");
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Options (Mongoose 6+ automatically handles standard options like useNewUrlParser and useUnifiedTopology)
        });
        console.log(`=== DB SUCCESS: ${conn.connection.host} ===`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
