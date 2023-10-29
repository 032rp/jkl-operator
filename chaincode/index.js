"use strict";

const healthContract = require("./contract.js");
module.exports.contracts = [healthContract];

// const result = new healthContract();

// const test = require("./test.js");
// const x = new test();

// let isRunning = true;

// function echoInfiniteTimes() {
//   const interval = setInterval(() => {
//     // Call the echoHelloWorld method and print the result
//     const result = x.echoHelloWorld();
//     console.log(result);
//   }, 1000); // Call the method every second (you can adjust the interval as needed)

//   setTimeout(() => {
//     clearInterval(interval); // Stop the interval after 10 minutes
//     isRunning = false;
//   }, 50000); // 10 minutes = 600,000 milliseconds
// }

// echoInfiniteTimes();

// // Optionally, you can use a signal to stop the execution gracefully
// process.on("SIGINT", () => {
//   if (isRunning) {
//     console.log("Stopping the application gracefully.");
//     clearInterval(interval);
//     process.exit(0);
//   }
// });
