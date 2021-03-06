var inquirer = require('inquirer');
const PledgeAdminUtils = require('./pledgeadmin-utils');
const PledgeUtils = require('./pledge-utils');
const TrxUtils = require('./trx-utils');
const Contracts = require("./contracts.js");
const Provider = require("./provider.js");
const Web3 = require('web3');

function doAction(actionText, action) {
  console.log(actionText)
  return new Promise(async(resolve, reject) => {
    inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'action',
          message: 'Execute?',
        }
      ]).then(async (answer) => {
        if (answer.action === false) return resolve();
        console.dir("executing...");
        try {
          await action()
        } catch (e) {
          console.dir("== error")
          console.dir(e)
        }
        console.log("\n");
        resolve()
      })
  });
}

class Actions {

  constructor(chain, accounts) {
    this.chain = chain || "development";
    this.accounts = accounts || [];
  }

  connect(options, cb) {
    const url = options.url;

    console.dir("connecting to: " + url);

    if (this.accounts.length > 0) {
      this.provider = new Provider();
      this.provider.initAccounts(this.accounts);
      if (url.indexOf("https") >= 0) {
        this.provider.startWeb3Provider("rpc", url, (options.accountIndex || 0))
      } else {
        this.provider.startWeb3Provider("ws", url, (options.accountIndex || 0))
      }
    } else {
      this.web3 = new Web3();
      this.web3.setProvider(url);
    }

    setTimeout(async () => {
      if (this.accounts.length > 0) {
        this.web3 = this.provider.web3;
      }

      let accounts = await this.web3.eth.getAccounts();
      console.dir("== accounts");
      console.dir(accounts);
      this.web3.eth.defaultAccount = accounts[(options.accountIndex || 0)]
      if (this.web3.eth.defaultAccount) {
        console.dir("using account: " + this.web3.eth.defaultAccount);
      } else {
        console.log("===================================");
        console.log("===================================");
        console.error("no account found at index " + (options.accountIndex || 0));
        console.log("===================================");
        console.log("===================================");
        process.exit();
      }

      let contracts = new Contracts(this.chain, this.web3);
      contracts.loadContracts();
      this.contracts = contracts.contracts;

      this.execute = TrxUtils.executeAndWait(this.web3);


      cb();
    }, 1000);
  }

  web3Object() {
    return this.web3;
  }

  async addProject(params) {
    params.commitTime = Math.floor(Date.now() / 1000) + params.commitTime;
    let text = `await LiquidPledging.methods.addProject(\"${params.name}\", \"${params.url}\", \"${params.account}\", ${params.parentProject}, ${params.commitTime}, \"${params.plugin}\").send({gas: 2000000, gasPrice: web3.utils.toWei(${params.gasPrice}, "gwei")})`
    return doAction(text, async () => {
      const toSend = this.contracts.LiquidPledging.methods.addProject(params.name, params.url, params.account, params.parentProject, params.commitTime, params.plugin);
      const receipt = await this.execute(toSend, this.web3.eth.defaultAccount, this.chain, params.gasPrice);
      console.dir("txHash: " + receipt.transactionHash);
      const projectId = receipt.events.ProjectAdded.returnValues.idProject;
      console.log("Project ID: " , projectId);
    });
  }

  async listProjects() {
    return new Promise(async (resolve, reject) => {
      try {
        const pledgeAdmins = await PledgeAdminUtils.getPledgeAdmins(this.contracts.LiquidPledging);
        PledgeAdminUtils.printTable(pledgeAdmins.filter(x => x.adminType === PledgeAdminUtils.constants.PROJECT));
      } catch(error){
        console.log(error);
        console.log("Couldn't obtain the list of projects: ", error.message);
      }
      resolve();
    });
  }

  async viewProject(params) {
    let text = `await LiquidPledging.methods.getPledgeAdmin(\"${params.id}\").call()`
    return doAction(text, async () => {
      try {
        const pledgeAdmin = await this.contracts.LiquidPledging.methods.getPledgeAdmin(params.id).call();
        pledgeAdmin.id = params.id;
        PledgeAdminUtils.printTable([pledgeAdmin].filter(x => x.adminType === PledgeAdminUtils.constants.PROJECT));
      } catch(error){
        console.log("Couldn't obtain the project: ", error.message);
      }
    });
  }

  async withdraw(params) {
    let text = `await LiquidPledging.methods.withdraw(\"${params.id}\", web3.utils.toWei(\"${params.amount}\", "ether")).send({gas: 2000000, gasPrice: web3.utils.toWei(${params.gasPrice}, "gwei")});\nawait LPVault.methods.confirmPayment(paymentId).send({gas: 2000000, gasPrice: web3.utils.toWei(${params.gasPrice}, "gwei")})`;
    return doAction(text, async () => {

      let toSend, receipt;

      toSend = this.contracts.LiquidPledging.methods.withdraw(params.id.toString(), this.web3.utils.toWei(params.amount.toString(), "ether"));
      receipt = await this.execute(toSend, this.web3.eth.defaultAccount, this.chain, params.gasPrice);

      console.dir("txHash: " + receipt.transactionHash);
      const paymentId = receipt.events.AuthorizePayment.returnValues.idPayment;
      console.log("Payment ID: " , paymentId);

      toSend = this.contracts.LPVault.methods.confirmPayment(paymentId);
      receipt = await this.execute(toSend, this.web3.eth.defaultAccount, this.chain, params.gasPrice);
      console.dir("txHash: " + receipt.transactionHash);
    });
  }

  async viewPledges(params) {
    return new Promise(async (resolve, reject) => {
      try {
        const pledges = await PledgeUtils.getPledges(this.contracts.LiquidPledging);
        PledgeUtils.printTable(pledges, this.web3);
      } catch(error){
        console.log(error);
        console.log("Couldn't obtain the list of pledges: ", error.message);
      }
      resolve();
    });
  }

  async listFunders() {
    return new Promise(async (resolve, reject) => {
      try {
        const pledgeAdmins = await PledgeAdminUtils.getPledgeAdmins(this.contracts.LiquidPledging);
        PledgeAdminUtils.printTable(pledgeAdmins.filter(x => x.adminType === PledgeAdminUtils.constants.FUNDER));
      } catch(error){
        console.log(error);
        console.log("Couldn't obtain the list of funders: ", error.message);
      }
      resolve();
    });
  }

  async addGiver(params) {
    params.commitTime = Math.floor(Date.now() / 1000) + params.commitTime;
    let text = `await LiquidPledging.methods.addGiver(\"${params.name}\", \"${params.url}\", ${params.commitTime}, \"${params.plugin}\").send({gas: 2000000, gasPrice: web3.utils.toWei(${params.gasPrice}, "gwei")})`
    return doAction(text, async () => {
      const toSend = this.contracts.LiquidPledging.methods.addGiver(params.name, params.url, params.commitTime, params.plugin);
      const receipt = await this.execute(toSend, this.web3.eth.defaultAccount, this.chain, params.gasPrice);
      console.dir("txHash: " + receipt.transactionHash);
      const funderId = receipt.events.GiverAdded.returnValues.idGiver;
      console.log("Funder ID: " , funderId);
    });
  }

  async mintToken(params) {
    let text = `await StandardToken.methods.mint(\"${params.account}\", web3.utils.toWei(\"${params.amount}\", \"ether\")).send({gas: 2000000, gasPrice: web3.utils.toWei(${params.gasPrice}, "gwei")})`
    return doAction(text, async () => {
      this.contracts.StandardToken.options.address = params.tokenAddress;
      const toSend = this.contracts.StandardToken.methods.mint(params.account, this.web3.utils.toWei(params.amount.toString(), "ether"));
      const receipt = await this.execute(toSend, this.web3.eth.defaultAccount, this.chain, params.gasPrice);
      console.dir("txHash: " + receipt.transactionHash);
    });
  }

  async approveToken(params) {
    let text = `await ERC20.methods.approve(\"${this.contracts.LiquidPledging.options.address}\", web3.utils.toWei(\"${params.amount}\", \"ether\")).send({gas: 2000000, gasPrice: web3.utils.toWei(${params.gasPrice}, "gwei")})`
    return doAction(text, async () => {
      this.contracts.StandardToken.options.address = params.tokenAddress;
      const toSend = this.contracts.StandardToken.methods.approve(this.contracts.LiquidPledging.options.address, this.web3.utils.toWei(params.amount.toString(), "ether"));
      const receipt = await this.execute(toSend, this.web3.eth.defaultAccount, this.chain, params.gasPrice);
      console.dir("txHash: " + receipt.transactionHash);
    });
  }

  async donate(params) {
    let text = `await LiquidPledging.methods.donate(${params.funderId}, ${params.projectId}, \"${params.tokenAddress}\", web3.utils.toWei(\"${params.amount}\", \"ether\")).send({gas: 2000000, gasPrice: web3.utils.toWei(${params.gasPrice}, "gwei")});`
    return doAction(text, async () => {
      const toSend = this.contracts.LiquidPledging.methods.donate(params.funderId, params.projectId, params.tokenAddress, this.web3.utils.toWei(params.amount.toString(), "ether"));
      const receipt = await this.execute(toSend, this.web3.eth.defaultAccount, this.chain, params.gasPrice);
      console.dir("txHash: " + receipt.transactionHash);
    });
  }

}

module.exports = Actions;
