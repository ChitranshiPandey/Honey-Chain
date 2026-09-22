const hre = require("hardhat");

async function main() {
  const BatchProvenance = await hre.ethers.getContractFactory("BatchProvenance");
  const contract = await BatchProvenance.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("BatchProvenance deployed to:", address);
  console.log("Set this in Honey-Chain/backend/.env as POLYGON_CONTRACT_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
