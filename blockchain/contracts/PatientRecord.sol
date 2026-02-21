// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PatientRecord {
    struct Record {
        string patientId;
        string doctorName;
        string diagnosis;
        string prescription;
        uint256 timestamp;
    }

    mapping(string => Record[]) private patientHistory;

    event RecordAdded(string patientId, uint256 timestamp);

    function addRecord(
        string memory patientId,
        string memory doctorName,
        string memory diagnosis,
        string memory prescription
    ) public {
        patientHistory[patientId].push(Record({
            patientId: patientId,
            doctorName: doctorName,
            diagnosis: diagnosis,
            prescription: prescription,
            timestamp: block.timestamp
        }));
        emit RecordAdded(patientId, block.timestamp);
    }

    function getRecords(string memory patientId) 
        public view returns (Record[] memory) {
        return patientHistory[patientId];
    }
}