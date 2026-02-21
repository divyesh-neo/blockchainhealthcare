// import hre from "hardhat";

// async function main() {
//   const PatientRecord = await hre.ethers.getContractFactory("PatientRecord");
//   const contract = await PatientRecord.deploy();
//   const address = await contract.getAddress();
//   console.log("Contract deployed to:", address);
// }

// main().catch(console.error);

import { Web3 } from 'web3';
import { readFileSync } from 'fs';

const web3 = new Web3('http://127.0.0.1:8545');

const abi = JSON.parse(readFileSync('./artifacts/contracts/PatientRecord.sol/PatientRecord.json', 'utf8')).abi;
const bytecode = JSON.parse(readFileSync('./artifacts/contracts/PatientRecord.sol/PatientRecord.json', 'utf8')).bytecode;

const accounts = await web3.eth.getAccounts();
const contract = new web3.eth.Contract(abi);
const deployed = await contract.deploy({ data: bytecode }).send({ from: accounts[0], gas: 3000000 });

console.log("Contract deployed to:", deployed.options.address);