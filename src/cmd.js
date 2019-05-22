var inquirer = require('inquirer');

async function main() {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
          'Projects',
          'Funders',
          new inquirer.Separator(),
          'Tokens',
          new inquirer.Separator(),
          'Exit'
        ]
      }
    ])
  // .then(answers => {
  //   console.log(JSON.stringify(answers, null, '  '));
  //   test()
  // });
}

async function projects() {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Projects> ',
        choices: [
          'List Projects',
          'Create Project',
          'View Project',
          // new inquirer.Separator(),
          // 'Back',
          // new inquirer.Separator(),
          // 'Exit'
        ]
      }
    ])
}

async function funders() {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Funders> ',
        choices: [
          'List Funders',
          'Create Funder',
          // new inquirer.Separator(),
          // 'Back',
          // new inquirer.Separator(),
          // 'Exit'
        ]
      }
    ])
}

async function tokens() {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Tokens> ',
        choices: [
          'Mint',
          'Aprove',
          // new inquirer.Separator(),
          // 'Back',
          // new inquirer.Separator(),
          // 'Exit'
        ]
      }
    ])
}

async function project(id) {
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Project> ' + id,
        choices: [
          'Donate/Pledge',
          // new inquirer.Separator(),
          // 'Back',
          // new inquirer.Separator(),
          // 'Exit'
        ]
      }
    ])
}

async function createProject(defaultAccount) {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the project name?',
      filter: String,
      validate: function(value) {
        return value.length > 0;
      }
    },
    {
      type: 'input',
      name: 'url',
      message: 'What is the project url?',
      default: "status.im",
      filter: String
    },
    {
      type: 'input',
      name: 'account',
      message: 'Address of the project admin?',
      default: defaultAccount,
      validate: function(value) {
        return value.indexOf("0x") === 0;
      }
    },
    {
      type: 'input',
      name: 'parentProject',
      message: 'What is the parent project?',
      default: 0,
      filter: Number
    },
    {
      type: 'input',
      name: 'commitTime',
      message: 'Time in seconds after which the project owner can access funds',
      default: 86400,
      filter: Number
    },
    {
      type: 'input',
      name: 'plugin',
      message: 'Plugin address',
      default: "0x0000000000000000000000000000000000000000",
      validate: function(value) {
        return value.indexOf("0x") === 0;
      }
    }
  ])
}

async function createFunder() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the funders name?',
      filter: String,
      validate: function(value) {
        return value.length > 0;
      }
    },
    {
      type: 'input',
      name: 'url',
      message: 'What is the funders url?',
      default: "status.im",
      filter: String
    },
    {
      type: 'input',
      name: 'commitTime',
      message: 'commit time',
      default: 86400,
      filter: Number
    },
    {
      type: 'input',
      name: 'plugin',
      message: 'Plugin address',
      default: "0x0000000000000000000000000000000000000000",
      validate: function(value) {
        return value.indexOf("0x") === 0;
      }
    }
  ])
}

async function mintToken() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'tokenAddress',
      message: 'What is the token address?',
      filter: String,
      validate: function(value) {
        return value.indexOf("0x") === 0;
      }
    },
    {
      type: 'input',
      name: 'account',
      message: 'What account to mint?',
      filter: String
    },
    {
      type: 'input',
      name: 'amount',
      message: 'amount (in ether units)',
      default: 2,
      filter: Number
    }
  ])
}

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

async function app() {
  console.dir("### Liquid Funding Console")
  let action = (await main()).action
  let subAction

  if (action === 'Projects') {
    subAction = (await projects()).action

    if (subAction === 'List Projects') {
    } if (subAction === 'Create Project') {
      let params = (await createProject("0x0000000000000000000000000000000000000001"))
      let text = `await LiquidPledging.methods.addProject(\"${params.name}\", \"${params.url}\", \"${params.account}\", ${params.parentProject}, ${params.commitTime}, \"${params.plugin}\").send({from: web3.eth.defaultAccount, gas: 2000000})`
      doAction(text, () => {
        let projectReceipt = await LiquidPledging.methods.addProject(params.name, params.url, params.account, params.parentProject, params.commitTime, params.plugin).send({from: web3.eth.defaultAccount, gas: 2000000});
        var projectId = projectReceipt.events.ProjectAdded.returnValues.idProject;

        console.log(projectId);
      });
    } if (subAction === 'view Project') {
    }
  } else if (action === 'Funders') {
    subAction = (await funders()).action

    if (subAction === 'List Funders') {
    } if (subAction === 'Create Funder') {
      let params = (await createProject())
      let text = `await LiquidPledging.methods.addGiver(\"${params.name}\", \"${params.url}\", ${params.commitTime}, \"${params.plugin}\").send({from: web3.eth.defaultAccount, gas: 2000000})`
      doAction(text, () => {
        let funderReceipt = await LiquidPledging.methods.addGiver(params.name, params.url, params.commitTime, params.plugin).send({from: web3.eth.defaultAccount, gas: 2000000})
        var funderId = funderReceipt.events.GiverAdded.returnValues.idGiver;
        console.log(funderId);
      });
    }
  } else if (action === 'Tokens') {
    subAction = (await tokens()).action

    if (subAction === 'Mint') {
      let params = (await mintToken())
      let text = `await StandardToken.methods.mint(\"${params.account}\", web3.utils.toWei(\"${params.amount}\", \"ether\")).send({gas: 2000000})`
      doAction(text, () => {
        await StandardToken.methods.mint(params.account, web3.utils.toWei(params.amount, "ether")).send({gas: 2000000})
      });
    } if (subAction === 'Aprove') {
    }
  } else if (action === 'Exit') {
    // const confirmation = await inquirer
    //   .prompt([
    //     {
    //       type: 'confirm',
    //       name: 'action',
    //       message: 'Are you sure you want to exit?',
    //     }
    //   ])

    process.exit()
  } else {
    console.dir("unknown action: " + action)
  }
}

//(() => {
app()
//})()

