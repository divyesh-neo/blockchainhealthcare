// import { Web3 } from 'web3';
// import { readFileSync } from 'fs';

// const web3 = new Web3('http://127.0.0.1:8545');

// const contractABI = JSON.parse(
//   readFileSync('./blockchain/artifacts/contracts/PatientRecord.sol/PatientRecord.json', 'utf8')
// ).abi;

// const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// export const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
// export const accounts = await web3.eth.getAccounts();

// export async function addPatientRecord(patientId, doctorName, diagnosis, prescription) {
//   await contract.methods.addRecord(patientId, doctorName, diagnosis, prescription)
//     .send({ from: accounts[0], gas: 300000 });
// }

// export async function getPatientHistory(patientId) {
//   return await contract.methods.getRecords(patientId).call();
// }

import { Web3 } from 'web3';
import { readFileSync } from 'fs';

const web3 = new Web3('http://127.0.0.1:8545');

const contractABI = JSON.parse(
  readFileSync('./blockchain/artifacts/contracts/PatientRecord.sol/PatientRecord.json', 'utf8')
).abi;

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);

export async function addPatientRecord(patientId, doctorName, diagnosis, prescription) {
  const accounts = await web3.eth.getAccounts();
  await contract.methods.addRecord(patientId, doctorName, diagnosis, prescription)
    .send({ from: accounts[0], gas: 300000 });
}

export async function getPatientHistory(patientId) {
  return await contract.methods.getRecords(patientId).call();
}