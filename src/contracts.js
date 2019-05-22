
class Contracts {

  constructor(chain, web3) {
    this.chain = chain;
    this.web3 = web3;
    this.contracts = {};
  }

  loadContracts() {
    console.dir("loading contracts for " + this.chain);
    const LiquidPledgingJSONConfig = require(`../chains/${this.chain}/contracts/LiquidPledging.json`);
    const LiquidPledging = new this.web3.eth.Contract(LiquidPledgingJSONConfig.abiDefinition, LiquidPledgingJSONConfig.address);
    this.contracts.LiquidPledging = LiquidPledging;

    const StandardTokenJSONConfig = require(`../chains/${this.chain}/contracts/StandardToken.json`);
    const StandardToken = new this.web3.eth.Contract(StandardTokenJSONConfig.abiDefinition, StandardTokenJSONConfig.address);
    this.contracts.StandardToken = StandardToken;
  }

}

module.exports = Contracts;
