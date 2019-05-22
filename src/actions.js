var inquirer = require('inquirer');
const Web3 = require("web3");
const Table = require('cli-table');


const Contracts = require("./contracts.js");

const web3 = new Web3();

function doAction(actionText, action) {
  console.dir(actionText)
  const confirmation = inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'action',
        message: 'Execute?',
      }
    ]).then((answer) => {
      if (answer.action === false) return;
      console.dir("executing...");
      try {
        action()
      } catch (e) {
        console.dir("== error")
        console.dir(e)
      }
    })
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

  addProject(params) {
    let text = `await LiquidPledging.methods.addProject(\"${params.name}\", \"${params.url}\", \"${params.account}\", ${params.parentProject}, ${params.commitTime}, \"${params.plugin}\").send({from: \"${web3.eth.defaultAccount}\", gas: 2000000})`
    doAction(text, async () => {
      let projectReceipt = await this.contracts.LiquidPledging.methods.addProject(params.name, params.url, params.account, params.parentProject, params.commitTime, params.plugin).send({from: web3.eth.defaultAccount, gas: 2000000});
      console.dir("txHash: " + projectReceipt.transactionHash)
      var projectId = projectReceipt.events.ProjectAdded.returnValues.idProject;

      console.log(projectId);
    });
  }

  async listProjects() {
    let numProjects = await LiquidPledging.methods.numberOfPledgeAdmins().call();
    
    const table = new Table({
      head: ['Id', 'Name', 'URL', 'ParentProject', 'Status', 'Commit Time', 'Owner', 'Plugin']
    });

    for(let i = 1; i <= numProjects; i++){
      const pledge = await LiquidPledging.methods.getPledgeAdmin(i).call();
      if(pledge.adminType !== '2') continue;

      table.push(
        [i, pledge.name, pledge.url, pledge.parentProject, pledge.canceled ? 'Canceled' : 'Active', pledge.commitTime, pledge.addr, pledge.plugin]
      );
    }

    console.log(table.toString());
  }

  addGiver(params) {
    let text = `await LiquidPledging.methods.addGiver(\"${params.name}\", \"${params.url}\", ${params.commitTime}, \"${params.plugin}\").send({from: \"${web3.eth.defaultAccount}\", gas: 2000000})`
    doAction(text, async () => {
      let funderReceipt = await this.contracts.LiquidPledging.methods.addGiver(params.name, params.url, params.commitTime, params.plugin).send({from: web3.eth.defaultAccount, gas: 2000000})
      console.dir("txHash: " + funderReceipt.transactionHash)
      var funderId = funderReceipt.events.GiverAdded.returnValues.idGiver;
      console.log(funderId);
    });
  }

  mintToken(params) {
    let text = `await StandardToken.methods.mint(\"${params.account}\", web3.utils.toWei(\"${params.amount}\", \"ether\")).send({gas: 2000000})`
    doAction(text, async () => {
      let mintReceipt = await this.contracts.StandardToken.methods.mint(params.account, web3.utils.toWei(params.amount, "ether")).send({gas: 2000000})
      console.dir("txHash: " + mintReceipt.transactionHash)
    });
  }

  approveToken(params) {
    let text = `await StandardToken.methods.approve(\"${this.contracts.LiquidPledging.options.address}\", web3.utils.toWei(\"${params.amount}\", \"ether\")).send({gas: 2000000})`
    doAction(text, async () => {
      let mintReceipt = await this.contracts.StandardToken.methods.approve(this.contracts.LiquidPledging.options.address, web3.utils.toWei(params.amount, "ether")).send({gas: 2000000})
      console.dir("txHash: " + mintReceipt.transactionHash)
    });
  }

  donate(params) {
    let text = `await LiquidPledging.methods.donate(${params.funderId}, ${params.projectId}, \"${this.contracts.LiquidPledging.options.address}\", web3.utils.toWei(\"${params.amount}\", \"ether\")).send({gas: 2000000});`
    doAction(text, async () => {
      let donateReceipt = await this.contracts.LiquidPledging.methods.donate(params.funderId, params.projectId, this.contracts.LiquidPledging.options.address, web3.utils.toWei(params.amount, "ether")).send({gas: 2000000});
      console.dir("txHash: " + donateReceipt.transactionHash)
    });
  }

}

module.exports = Actions;
