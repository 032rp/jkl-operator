const connectToNetwork  = require('./utils');

async function addNewPatients(user, patientName, aadhaar, age, gender, mobileNo, address) {
    try {
        const { gateway, contract } = await connectToNetwork(user);

        const result = await contract.submitTransaction('addNewPatients', patientName, aadhaar, age, gender, mobileNo, address);
        console.log("Transaction has been submitted");

        gateway.disconnect();
        return result.toString();  // Convert Buffer to string
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

async function createAppointment(user, thisPatientID, aadhaar, department, doctorName, hospitalName) {
  try {
      const { gateway, contract } = await connectToNetwork(user);

      const result = await contract.submitTransaction('createAppointment', thisPatientID, aadhaar, department, doctorName, hospitalName);
      console.log("Transaction has been submitted");

      gateway.disconnect();
      return result.toString();  // Convert Buffer to string
  } catch (error) {
      console.error(`Failed to submit transaction: ${error}`);
      process.exit(1);
  }
}

async function addVitals(user, thisPatientID, aadhaar, bp, bloodoxygen, pulses, bodytemperature, bloodsugar) {
  try {
      const { gateway, contract } = await connectToNetwork(user);

      const result = await contract.submitTransaction('addVitals', thisPatientID, aadhaar, bp, bloodoxygen, pulses, bodytemperature, bloodsugar);
      console.log("Transaction has been submitted");

      gateway.disconnect();
      return result.toString();  // Convert Buffer to string
  } catch (error) {
      console.error(`Failed to submit transaction: ${error}`);
      process.exit(1);
  }
}

async function addVisit(user, thisPatientID, aadhaar, description, doctorName, diagnosis, prescription, testName, testReportIPFSHash) {
  try {
      const { gateway, contract } = await connectToNetwork(user);

      const result = await contract.submitTransaction('addVisit', thisPatientID, aadhaar, description, doctorName, diagnosis, prescription, testName, testReportIPFSHash);
      console.log("Transaction has been submitted");

      gateway.disconnect();
      return result.toString();  // Convert Buffer to string
  } catch (error) {
      console.error(`Failed to submit transaction: ${error}`);
      process.exit(1);
  }
}


module.exports = {
  addNewPatients,
  createAppointment,
  addVitals,
  addVisit
};
