// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Tamper-evident provenance ledger for Honey Chain batches.
/// @dev Stores only a hash per record — never the human-readable batch data.
///      The backend is the source of truth for readable data; this contract
///      is the trust anchor that proves a given hash existed, unedited, at a
///      given block/time. See Honey-Chain/report.md for the full design.
contract BatchProvenance {
    struct Record {
        bytes32 dataHash;
        uint256 recordedAt;
        address recordedBy;
    }

    /// @dev One fixed record per batch, written once at batch creation.
    mapping(string => Record) private batchRecords;

    /// @dev Ordered history of provenance events per batch (quality check,
    ///      packaging, dispatch, delivery, ...), each hashed independently.
    mapping(string => Record[]) private batchEvents;

    address public immutable owner;

    event BatchRecorded(string indexed batchId, bytes32 dataHash, uint256 timestamp);
    event BatchEventRecorded(string indexed batchId, uint256 eventIndex, bytes32 dataHash, uint256 timestamp);

    error NotOwner();
    error BatchAlreadyRecorded();
    error BatchNotFound();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Record a new batch's data hash. Callable once per batch ID.
    function recordBatch(string calldata batchId, bytes32 dataHash) external onlyOwner {
        if (batchRecords[batchId].recordedAt != 0) revert BatchAlreadyRecorded();
        batchRecords[batchId] = Record(dataHash, block.timestamp, msg.sender);
        emit BatchRecorded(batchId, dataHash, block.timestamp);
    }

    /// @notice Append a provenance event (quality check, packaging, dispatch, ...) for a batch.
    function recordEvent(string calldata batchId, bytes32 dataHash) external onlyOwner {
        if (batchRecords[batchId].recordedAt == 0) revert BatchNotFound();
        batchEvents[batchId].push(Record(dataHash, block.timestamp, msg.sender));
        emit BatchEventRecorded(batchId, batchEvents[batchId].length - 1, dataHash, block.timestamp);
    }

    /// @notice Read back a batch's stored hash — free, no gas, used by /verify.
    function getBatch(string calldata batchId) external view returns (bytes32 dataHash, uint256 recordedAt) {
        Record memory record = batchRecords[batchId];
        return (record.dataHash, record.recordedAt);
    }

    /// @notice Number of provenance events recorded for a batch.
    function getEventCount(string calldata batchId) external view returns (uint256) {
        return batchEvents[batchId].length;
    }

    /// @notice Read back one provenance event by index.
    function getEventRecord(string calldata batchId, uint256 index) external view returns (bytes32 dataHash, uint256 recordedAt) {
        Record memory record = batchEvents[batchId][index];
        return (record.dataHash, record.recordedAt);
    }
}
