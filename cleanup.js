const mongoose = require("mongoose");
const Alert = require("./models/Alert");
const { ethers } = require("ethers");
require("dotenv").config();

async function cleanupInvalidAlerts() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("Connected to MongoDB for cleanup...");

        const allAlerts = await Alert.find({});
        console.log(`Total alerts found: ${allAlerts.length}`);

        let invalidCount = 0;
        const invalidIds = [];


        for (const alert of allAlerts) {
            if (!alert.contract || 
                alert.contract === "undefined" || 
                alert.contract === "null" || 
                alert.contract === "" ||
                !ethers.isAddress(alert.contract)) {
                
                console.log(`Invalid alert found: ID=${alert._id}, contract=${alert.contract}`);
                invalidIds.push(alert._id);
                invalidCount++;
            }
        }

        if (invalidCount > 0) {
           
            const result = await Alert.deleteMany({
                _id: { $in: invalidIds }
            });
            
            console.log(`✅ Removed ${result.deletedCount} invalid alerts`);
        } else {
            console.log("✅ No invalid alerts found");
        }

        const validAlerts = await Alert.find({});
        console.log(`✅ ${validAlerts.length} valid alerts remaining`);

    } catch (error) {
        console.error("❌ Cleanup error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
        process.exit(0);
    }
}

cleanupInvalidAlerts();
