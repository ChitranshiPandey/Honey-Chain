const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("BatchProvenance", function () {
  async function deploy() {
    const [owner, other] = await ethers.getSigners();
    const BatchProvenance = await ethers.getContractFactory("BatchProvenance");
    const contract = await BatchProvenance.deploy();
    await contract.waitForDeployment();
    return { contract, owner, other };
  }

  it("records a batch hash and reads it back", async function () {
    const { contract } = await deploy();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("HC-MP-2026-00001:2026-01-01:12.5"));

    await expect(contract.recordBatch("HC-MP-2026-00001", hash))
      .to.emit(contract, "BatchRecorded")
      .withArgs("HC-MP-2026-00001", hash, anyValue);

    const [dataHash, recordedAt] = await contract.getBatch("HC-MP-2026-00001");
    expect(dataHash).to.equal(hash);
    expect(recordedAt).to.be.gt(0);
  });

  it("rejects recording the same batch id twice", async function () {
    const { contract } = await deploy();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("data"));
    await contract.recordBatch("HC-MP-2026-00001", hash);

    await expect(contract.recordBatch("HC-MP-2026-00001", hash)).to.be.revertedWithCustomError(
      contract,
      "BatchAlreadyRecorded"
    );
  });

  it("rejects writes from a non-owner account", async function () {
    const { contract, other } = await deploy();
    const hash = ethers.keccak256(ethers.toUtf8Bytes("data"));

    await expect(contract.connect(other).recordBatch("HC-MP-2026-00001", hash)).to.be.revertedWithCustomError(
      contract,
      "NotOwner"
    );
  });

  it("appends provenance events and reads them back in order", async function () {
    const { contract } = await deploy();
    const batchHash = ethers.keccak256(ethers.toUtf8Bytes("batch"));
    const eventHash = ethers.keccak256(ethers.toUtf8Bytes("quality-check-passed"));

    await contract.recordBatch("HC-MP-2026-00001", batchHash);
    await contract.recordEvent("HC-MP-2026-00001", eventHash);

    expect(await contract.getEventCount("HC-MP-2026-00001")).to.equal(1);
    const [dataHash] = await contract.getEventRecord("HC-MP-2026-00001", 0);
    expect(dataHash).to.equal(eventHash);
  });

  it("rejects an event for a batch that was never recorded", async function () {
    const { contract } = await deploy();
    const eventHash = ethers.keccak256(ethers.toUtf8Bytes("data"));

    await expect(contract.recordEvent("HC-MP-2026-99999", eventHash)).to.be.revertedWithCustomError(
      contract,
      "BatchNotFound"
    );
  });
});
