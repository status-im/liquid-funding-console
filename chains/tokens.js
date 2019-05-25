const StandardToken_development = require("./development/contracts/StandardToken.json");
const StandardToken_ropsten = require("./ropsten/contracts/StandardToken.json");

module.exports = {
  development: [
    {
      name: "StandardToken",
      value: StandardToken_development.address
    }
  ],
  ropsten: [
    {
      name: "StandardToken",
      value: StandardToken_ropsten.address
    },
    {
      name: "STT",
      value: "0xc55cf4b03948d7ebc8b9e8bad92643703811d162"
    }
  ],
  rinkeby: [

  ],
  mainnet: [
    {
      name: "SNT",
      value: "0x744d70fdbe2ba4cf95131626614a1763df805b9e"
    }
  ]
};
