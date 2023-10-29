'use strict';

const { Contract } = require('fabric-contract-api');
const fs = require('fs');



class HealthContract extends Contract {

    constructor() {
        super('healthnet');
    }

    // a. Instantiate
    async instantiate(ctx) {
        console.log('Chaincode was successfully deployed.');
    }



    async addNewPatients(ctx, patientName, aadhaar, age, gender, mobileNo, address) {

        const iterator = await ctx.stub.getStateByPartialCompositeKey('healthnet.patient', [aadhaar]);
        const patientBuffer = [];
        let result;

        while (true) {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                patientBuffer.push({
                    key: result.value.key,
                    value: result.value.value.toString('utf8')
                });
            }

            if (result.done) {
                await iterator.close();
                break;
            }
        }
        console.log(patientBuffer);
        if (patientBuffer.length > 0) {
            throw new Error(`This patient with aadhaar ${aadhaar} already exists`);
        }
        else {
            const patientCounter = await ctx.stub.getState('healthnet.patientCounter').catch(err => console.log(err));
            let thisPatientID = 'INRJ';

            if (!patientCounter || patientCounter.length === 0) {
                thisPatientID += '000000001'; 
            }
            else {
                const counter = parseInt(patientCounter.toString());
                thisPatientID += (counter + 1).toString().padStart(9, "0");
            }
            const patientKey = await ctx.stub.createCompositeKey('healthnet.patient', [aadhaar, thisPatientID]);

            const patientDetails = {
                patientID: thisPatientID,
                Name: patientName,
                Aadhaar: aadhaar,
                Age: age,
                Gender: gender,
                contactInfo: mobileNo,
                Address: address,
                AppointmentHistory: [],
                vitalHistory: [],
                MedicalVisits: []
            };

            await ctx.stub.putState(patientKey, Buffer.from(JSON.stringify(patientDetails)));
            await ctx.stub.putState('healthnet.patientCounter', Buffer.from(thisPatientID.substring(4)));
            return patientDetails;
        }
    }


    async createAppointment(ctx, thisPatientID, aadhaar, department, doctorName, hospitalName) {
        
        const patientKey = await ctx.stub.createCompositeKey('healthnet.patient', [aadhaar, thisPatientID]);
        const iterator = await ctx.stub.getStateByPartialCompositeKey('healthnet.patient', [aadhaar]);

        const patientBuffer = [];
        let result;

        while (true) {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                patientBuffer.push({
                    key: result.value.key,
                    value: result.value.value.toString('utf8')
                });
            }

            if (result.done) {
                await iterator.close();
                break;
            }
        }

        if (patientBuffer.length > 0) {
            const patientObj = JSON.parse(patientBuffer[0].value);

            const appointment = {
                Department: department,
                DoctorName: doctorName,
                HospitalName: hospitalName,
                Date: ctx.stub.getTxTimestamp()
            };

            patientObj.AppointmentHistory.push(appointment);

            await ctx.stub.putState(patientKey, Buffer.from(JSON.stringify(patientObj)));
            return patientObj;
        } else {
            return `No patient found with aadhaar: ${aadhaar}`;
        }
    }




    async addVitals(ctx, thisPatientID, aadhaar, bp, bloodoxygen, pulses, bodytemperature, bloodsugar) {
        const patientKey = await ctx.stub.createCompositeKey('healthnet.patient', [aadhaar, thisPatientID]);
        const iterator = await ctx.stub.getStateByPartialCompositeKey('healthnet.patient', [aadhaar]).catch(err => console.log(err));
        const patientBuffer = [];
        let result;

        while (true) {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                patientBuffer.push({
                    key: result.value.key,
                    value: result.value.value.toString('utf8')
                });
            }

            if (result.done) {
                await iterator.close();
                break;
            }
        }
        if (patientBuffer.length > 0) {
            const patientObj = JSON.parse(patientBuffer[0].value);
            patientObj.vitalHistory.push({ Date: ctx.stub.getTxTimestamp(), bloodPressure: bp, oxygenLevel: bloodoxygen, pulseRate: pulses, bodyTemperature: bodytemperature, sugarLevel: bloodsugar });
            await ctx.stub.putState(patientKey, Buffer.from(JSON.stringify(patientObj)));
            return patientObj;
        }
        else {
            throw new Error("This patient is not registered, please get registered first");
        }

    }
   
    async addVisit(ctx, thisPatientID, aadhaar, description, doctorName, diagnosis, prescription, testName, testReportIPFSHash) {
        const patientKey = await ctx.stub.createCompositeKey('healthnet.patient', [aadhaar, thisPatientID]);
        const iterator = await ctx.stub.getStateByPartialCompositeKey('healthnet.patient', [aadhaar]).catch(err => console.log(err));
        const patientBuffer = [];
        let result;

        while (true) {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                patientBuffer.push({
                    key: result.value.key,
                    value: result.value.value.toString('utf8')
                });
            }

            if (result.done) {
                await iterator.close();
                break;
            }
        }

        if (patientBuffer.length > 0) {
            const patientObj = JSON.parse(patientBuffer[0].value);
            const visit = {
                Date: ctx.stub.getTxTimestamp(),
                Description: description,
                Doctor: doctorName,
                Diagnosis: diagnosis,
                Prescription: prescription,
                TestName: testName,
                TestReport: testReportIPFSHash 
            };

      
            patientObj.MedicalVisits.push(visit);

           await ctx.stub.putState(patientKey, Buffer.from(JSON.stringify(patientObj)));

            return patientObj;
        } else {
            throw new Error("This patient is not registered, please get registered first");
        }
    }


    async getPatients(ctx, aadhaar) {
      
        const iterator = await ctx.stub.getStateByPartialCompositeKey('healthnet.patient', [aadhaar]).catch(err => console.log(err));
        const patientBuffer = [];
        let result;

        while (true) {
            result = await iterator.next();

            if (result.value && result.value.value.toString()) {
                patientBuffer.push({
                    key: result.value.key,
                    value: result.value.value.toString('utf8')
                });
            }

            if (result.done) {
                await iterator.close();
                break;
            }
        }
        if (patientBuffer && patientBuffer.length > 0) {
            const patientObj = JSON.parse(patientBuffer[0].value);
            return patientObj;
        }
        else {
            throw new Error(`No patient register with this id ${aadhaar}`);

        }

    }
}

module.exports = HealthContract;
