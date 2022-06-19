require("@nomiclabs/hardhat-waffle")

module.exports = {
  solidity: "0.7.6",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/vtqCl_WPHwVu683HSlNFlL36pTaaWIJw",
      },
    },
  },
}
