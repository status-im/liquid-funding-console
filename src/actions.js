var inquirer = require('inquirer');
const Web3 = require("web3");

const web3 = new Web3();

const LiquidPledgingJSONConfig = require("../dist/contracts/LiquidPledging.json");
const LiquidPledging = new web3.eth.Contract(LiquidPledgingJSONConfig.abiDefinition, LiquidPledgingJSONConfig.address);

function doAction(actionText, action) {
  console.dir(actionText)
  const confirmation = inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'action',
        message: 'Execute?',
      }
    ]).then(() => {
      console.dir("executing...");
      action()
    })
}

class Actions {

  constructor() {
  }

  connect() {
    web3.setProvider("ws://localhost:8556");
  }

  addProject(params) {
    let text = `await LiquidPledging.methods.addProject(\"${params.name}\", \"${params.url}\", \"${params.account}\", ${params.parentProject}, ${params.commitTime}, \"${params.plugin}\").send({from: web3.eth.defaultAccount, gas: 2000000})`
    doAction(text, async () => {
      let projectReceipt = await LiquidPledging.methods.addProject(params.name, params.url, params.account, params.parentProject, params.commitTime, params.plugin).send({from: web3.eth.defaultAccount, gas: 2000000});
      var projectId = projectReceipt.events.ProjectAdded.returnValues.idProject;

      console.log(projectId);
    });
  }

  addGiver(params) {
    let text = `await LiquidPledging.methods.addGiver(\"${params.name}\", \"${params.url}\", ${params.commitTime}, \"${params.plugin}\").send({from: web3.eth.defaultAccount, gas: 2000000})`
    doAction(text, async () => {
      let funderReceipt = await LiquidPledging.methods.addGiver(params.name, params.url, params.commitTime, params.plugin).send({from: web3.eth.defaultAccount, gas: 2000000})
      var funderId = funderReceipt.events.GiverAdded.returnValues.idGiver;
      console.log(funderId);
    });
  }

  mintToken(params) {
    let text = `await StandardToken.methods.mint(\"${params.account}\", web3.utils.toWei(\"${params.amount}\", \"ether\")).send({gas: 2000000})`
    doAction(text, async () => {
      await StandardToken.methods.mint(params.account, web3.utils.toWei(params.amount, "ether")).send({gas: 2000000})
    });
  }

}

module.exports = Actions;
