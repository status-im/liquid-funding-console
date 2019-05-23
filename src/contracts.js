
class Contracts {

  constructor(chain, web3) {
    this.chain = chain;
    this.web3 = web3;
    this.contracts = {};
  }

  loadContracts() {
    console.dir("loading contracts for " + this.chain);
    const LPVaultJSONConfig = require(`../chains/${this.chain}/contracts/LPVault.json`);
    const LPVault = new this.web3.eth.Contract(LPVaultJSONConfig.abiDefinition, LPVaultJSONConfig.address);

    const LiquidPledgingJSONConfig = require(`../chains/${this.chain}/contracts/LiquidPledging.json`);
    const LiquidPledging = new this.web3.eth.Contract(LiquidPledgingJSONConfig.abiDefinition, LiquidPledgingJSONConfig.address);

    const StandardTokenJSONConfig = require(`../chains/${this.chain}/contracts/StandardToken.json`);
    const StandardToken = new this.web3.eth.Contract(StandardTokenJSONConfig.abiDefinition, StandardTokenJSONConfig.address);

    LiquidPledging.options.jsonInterface.push(LPVault.options.jsonInterface.find(x => x.type === 'event' && x.name ==='AuthorizePayment')); 

    this.contracts.LiquidPledging = LiquidPledging;
    this.contracts.LPVault = LPVault;
    this.contracts.StandardToken = StandardToken;
  }

}

module.exports = Contracts;
