
class Contracts {

  constructor(chain, web3) {
    this.chain = chain;
    this.web3 = web3;
    this.contracts = {};
  }

  loadContracts() {
    const LiquidPledgingJSONConfig = require("../dist/contracts/LiquidPledging.json");
    const LiquidPledging = new this.web3.eth.Contract(LiquidPledgingJSONConfig.abiDefinition, LiquidPledgingJSONConfig.address);
    this.contracts.LiquidPledging = LiquidPledging;

    const StandardTokenJSONConfig = require("../dist/contracts/StandardToken.json");
    const StandardToken = new this.web3.eth.Contract(StandardTokenJSONConfig.abiDefinition, StandardTokenJSONConfig.address);
    this.contracts.StandardToken = StandardToken;
  }

}

module.exports = Contracts;
