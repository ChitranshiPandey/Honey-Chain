require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { POLYGON_RPC_URL, POLYGON_PRIVATE_KEY } = process.env;

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    // Only defined when credentials are present — `npx hardhat compile` and
    // the local `hardhat` network work with zero setup either way.
    ...(POLYGON_RPC_URL && POLYGON_PRIVATE_KEY
      ? {
          amoy: {
            url: POLYGON_RPC_URL,
            accounts: [POLYGON_PRIVATE_KEY],
            chainId: 80002,
          },
        }
      : {}),
  },
};
