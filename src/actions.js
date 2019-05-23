var inquirer = require('inquirer');
const Web3 = require("web3");
const PledgeAdminUtils = require('./pledgeadmin-utils');
const TrxUtils = require('./trx-utils');
const Contracts = require("./contracts.js");

const web3 = new Web3();

function doAction(actionText, action) {
  console.dir(actionText)
  return new Promise(async(resolve, reject) => {
    inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'action',
          message: 'Execute?',
        }
      ]).then((answer) => {
        if (answer.action === false) return resolve();
        console.dir("executing...");
        try {
          action()
        } catch (e) {
          console.dir("== error")
          console.dir(e)
        }
        resolve()
      })
  });
}

class Actions {

  constructor(chain) {
    this.chain = chain || "development";
  }

  connect(url, cb) {
    console.dir("connecting to: " + url);
    web3.setProvider(url);

    setTimeout(async () => {
      let accounts = await web3.eth.getAccounts();
      console.dir("== accounts");
      console.dir(accounts);
      web3.eth.defaultAccount = accounts[0]

      let contracts = new Contracts(this.chain, web3);
      contracts.loadContracts();
      this.contracts = contracts.contracts;

      cb();
    }, 1000);
  }

  web3() {
    return web3;
  }

  async addProject(params) {
    let text = `await LiquidPledging.methods.addProject(\"${params.name}\", \"${params.url}\", \"${params.account}\", ${params.parentProject}, ${params.commitTime}, \"${params.plugin}\").send({from: \"${web3.eth.defaultAccount}\", gas: 2000000})`
    return doAction(text, async () => {
      const toSend = this.contracts.LiquidPledging.methods.addProject(params.name, params.url, params.account, params.parentProject, params.commitTime, params.plugin);
      const receipt = await TrxUtils.executeAndWait(toSend, web3.eth.defaultAccount);
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
        PledgeAdminUtils.printTable([pledgeAdmin].filter(x => x.adminType === PledgeAdminUtils.constants.PROJECT));
      } catch(error){
        console.log("Couldn't obtain the project: ", error.message);
      }
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
    let text = `await LiquidPledging.methods.addGiver(\"${params.name}\", \"${params.url}\", ${params.commitTime}, \"${params.plugin}\").send({from: \"${web3.eth.defaultAccount}\", gas: 2000000})`
    return doAction(text, async () => {
      const toSend = this.contracts.LiquidPledging.methods.addGiver(params.name, params.url, params.commitTime, params.plugin);
      const receipt = await TrxUtils.executeAndWait(toSend, web3.eth.defaultAccount);
      console.dir("txHash: " + receipt.transactionHash);
      const funderId = receipt.events.GiverAdded.returnValues.idGiver;
      console.log("Funder ID: " , funderId);
    });
  }

  async mintToken(params) {
    let text = `await StandardToken.methods.mint(\"${params.account}\", web3.utils.toWei(\"${params.amount}\", \"ether\")).send({gas: 2000000})`
    return doAction(text, async () => {
      const toSend = this.contracts.StandardToken.methods.mint(params.account, web3.utils.toWei(params.amount.toString(), "ether"));
      const receipt = await TrxUtils.executeAndWait(toSend, web3.eth.defaultAccount);
      console.dir("txHash: " + receipt.transactionHash);
    });
  }

  async approveToken(params) {
    let text = `await StandardToken.methods.approve(\"${this.contracts.LiquidPledging.options.address}\", web3.utils.toWei(\"${params.amount}\", \"ether\")).send({gas: 2000000})`
    return doAction(text, async () => {
      const toSend = this.contracts.StandardToken.methods.approve(this.contracts.LiquidPledging.options.address, web3.utils.toWei(params.amount.toString(), "ether"));
      const receipt = await TrxUtils.executeAndWait(toSend, web3.eth.defaultAccount);
      console.dir("txHash: " + receipt.transactionHash);
    });
  }

  async donate(params) {
    let text = `await LiquidPledging.methods.donate(${params.funderId}, ${params.projectId}, \"${this.contracts.LiquidPledging.options.address}\", web3.utils.toWei(\"${params.amount}\", \"ether\")).send({gas: 2000000});`
    return doAction(text, async () => {
      const toSend = this.contracts.LiquidPledging.methods.donate(params.funderId, params.projectId, this.contracts.LiquidPledging.options.address, web3.utils.toWei(params.amount.toString(), "ether"));
      const receipt = await TrxUtils.executeAndWait(toSend, web3.eth.defaultAccount);
      console.dir("txHash: " + receipt.transactionHash);
    });
  }

}

module.exports = Actions;
