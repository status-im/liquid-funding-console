const Web3 = require("web3");

const LiquidPledgingJSONConfig = require("./dist/contracts/LiquidPledging.json");

const web3 = new Web3();

web3.setProvider("ws://localhost:8556");

setTimeout(async () => {

  let accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0]

  const LiquidPledging = new web3.eth.Contract(LiquidPledgingJSONConfig.abiDefinition, LiquidPledgingJSONConfig.address);

  var projectReceipt = await LiquidPledging.methods.addProject("projectname", "status.im", web3.eth.defaultAccount, 0, 86400, "0x0000000000000000000000000000000000000000").send({from: web3.eth.defaultAccount, gas: 2000000});

  // Project ID
  var projectId = projectReceipt.events.ProjectAdded.returnValues.idProject;

  console.log(projectId);

}, 1000);

