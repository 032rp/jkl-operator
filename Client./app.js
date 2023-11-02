const express = require('express');
const cors = require('cors');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage});
const register = require('./registerUser');
const enroll = require('./enrollAdmin');
const {
    addNewPatients,
    createAppointment,
    addVitals,
    addVisit
} = require('./invoke');

const { getPatients } = require('./query');


const app = express();
const port = 3000;
const { create } = require('ipfs-http-client');

async function ipfsClient(){
   
    const ipfs = await create(
    {
        host:"a910711327a10474b90ffba791442beb-905657035.ap-south-2.elb.amazonaws.com",
        port: 9095, 
        protocol: "http",
        
    }
    );
    return ipfs;
}

// async function ipfsClient(){
   
//     const ipfs = await create(
//     {
//         host:"127.0.0.1:8080",
//         port: 8080, 
//         protocol: "http",
        
//     }
//     );
//     return ipfs;
// }

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post('/register', async (req, res) => {
    try{
        const{user} = req.body;
        await register(user);
        res.send({status:'success', message: `${user} is successfully registered` });
    }catch(e){
        const result ={
            status : "error",
            message: "Failed to register the user",
            error: e.message
        }
        res.status(500).send(result);
    }
});

app.post('/enroll', async (req, res) => {
    try{
        await enroll();
        res.send({status: "success", message: 'user enrolled successfully '});
    }catch(e){
        console.log(e)
        const result = {
            status : 'error',
            message : "Failed to enrolled",
            
        }
        res.status(500).send(result);
    }
});

// Endpoint to add new patients
app.post('/addNewPatients', async (req, res) => {
    try{
    const { user, patientName, aadhaar, age, gender, mobileNo, address } = req.body;
    const result = await addNewPatients(user, patientName, aadhaar, age, gender, mobileNo, address);
    res.send({status : "success", message: "Patient added successfully", data : result});
    }catch(e){
        const result = {
            status : "error",
            message : "Failed to add patient",
            error : e.message
        }
        res.status(500).send(result);
    }
});

// Endpoint to create an appointment
app.post('/createAppointment', async (req, res) => {
    try{
    const { user, thisPatientID, aadhaar, department, doctorName, hospitalName } = req.body;
    const result = await createAppointment(user, thisPatientID, aadhaar, department, doctorName, hospitalName);
    res.send({status : "success", message: "Appoinment created successfully", data : result});
    }catch(e){
        const result = {
            status: "error",
            message: "failed to create appoinment",
            error : e.message
        }
        res.status(500).send(result);
    }
});

// Endpoint to add vitals
app.post('/addVitals', async (req, res) => {
    try{
    const { user, thisPatientID, aadhaar, bp, bloodoxygen, pulses, bodytemperature, bloodsugar } = req.body;
    const result = await addVitals(user, thisPatientID, aadhaar, bp, bloodoxygen, pulses, bodytemperature, bloodsugar);
    res.send({status:"success", message: "Vitals has been added successfully", data: result});
    }catch(e){
        const result = {
            status: "error",
            message: "Failed to add Vitals",
            error: e.message
        }
        res.status(500).send(result);
    }
});

// Endpoint to add visit
app.post('/addVisit', upload.single('testReport'), async (req, res) => {
    try{
    const { user, thisPatientID, aadhaar, description, doctorName, diagnosis, prescription, testName} = req.body;
    const testReportBuffer = req.file.buffer;
    // // const testReportBuffer = Buffer.from(testReport.buffer, 'base64');
    // const testReportBuffer = testReport.buffer
        let ipfs = await ipfsClient();
        const ipfsResult = await ipfs.add(testReportBuffer);
        const testReportIPFSHash = ipfsResult.cid.toString();
    const result = await addVisit(user, thisPatientID, aadhaar, description, doctorName, diagnosis, prescription, testName, testReportIPFSHash);
    res.json({ status: "success", message: "Patient's visits added successfully!", data: result });
    }
    catch(e){
        console.log(e)
        const result = {
            status : "error",
            message : "Failed to add visit of the patient",
            error : e.message
        }
        res.status(500).send(result);
    }
});

// Endpoint to query patient details based on aadhaar
// app.get('/getPatients/:user/:aadhaar', async (req, res) => {
//     try{
//     // const { user } = req.query;  // Assume user is sent as a query parameter
//     const { user, aadhaar } = req.params;
//     console.log('User:', user, 'Aadhaar:', aadhaar);
//     const result = await getPatients(user, aadhaar);
//     res.send({status:"success", message:"Patient's details has been fetched", data: result});
//     }catch(e){
//         console.log(e)
//         const result = {
//             status : "error",
//             message: "Failed to get details for patients",
//             error: e.message
//         }
//         res.status(500).send(result);
//     }
// });

//  app.get('/getPatients', async (req, res) => {
//     try {
//         const { user, aadhaar } = req.query;
//         console.log('User:', user, 'Aadhaar:', aadhaar);
//        const result = await getPatients(user, aadhaar);
//         res.send({ status: "success", message: "Patient's details have been fetched", data: result });
//      } catch (e) {
//          console.error(e);
//         res.status(500).send({
//             status: "error",
//             message: "Failed to get details for patients",
//             error: e.message
//         });
//     }
//  });

app.get('/getPatients/:user/:aadhaar', async (req, res) => {
    try {
        const { user, aadhaar } = req.params;
        console.log('User:', user, 'Aadhaar:', aadhaar);
        
        const patientDetailsString = await getPatients(user, aadhaar);
        const patientDetails = JSON.parse(patientDetailsString);
        console.log(patientDetails.MedicalVisits)
       if(patientDetails.MedicalVisits && patientDetails.MedicalVisits.length > 0) {
        // const ipfsHash = patientDetails.MedicalVisits[0].TestReport;
        // Initialize an array to hold the IPFS gateway URLs
        const ipfsUrls = [];

        // Assuming patientDetails contains a property 'medicalVisits' which is an array of visits
        // and each visit has a property 'testReport' containing the IPFS hash of the test report
        for (const visit of patientDetails.MedicalVisits) {
            const ipfsHash = visit.TestReport;

        //     // Define the IPFS gateway URL
            const gatewayUrl = `127.0.0.1:8080/ipfs/${ipfsHash}`;

            ipfsUrls.push(gatewayUrl);
        }
        // const gatewayUrl = `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`;
        const result = {
            status: "success",
            message: "Patient's details has been fetched",
            data: patientDetails,
            ipfsUrls: ipfsUrls
        };

        res.send(result);
    }
    else{
        const result = {
            status: "success",
            message: "Patient's details has been fetched",
            data: patientDetails,
            
        };
        res.send(result);
    }
    } catch (e) {
        console.log(e)
        const result = {
            status: "error",
            message: "Failed to get details for patients",
            error: e.message
        };
        res.status(500).send(result);
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
