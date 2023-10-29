const connectToNetwork  = require('./utils');

async function getPatients(user, aadhaar) {
    try {
        const { gateway, contract } = await connectToNetwork(user);

        const result = await contract.evaluateTransaction('getPatients', aadhaar);

        gateway.disconnect();
        return result.toString();  // Convert Buffer to string
    } catch (error) {
        console.error(`Failed to query chaincode: ${error}`);
        process.exit(1);
    }
}

module.exports = { getPatients, };
