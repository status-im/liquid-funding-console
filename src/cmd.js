var inquirer = require('inquirer');
const menus = require('./menus.js');

function mainMenu(actions) {
  return new Promise(async (resolve, reject) => {
    let action = (await menus.main()).action
    let subAction

    if (action === 'Projects') {
      subAction = (await menus.projects()).action

      if (subAction === 'List Projects') {
        await actions.listProjects();
      } 
      
      if (subAction === 'Create Project') {
        let params = (await menus.createProject(actions.web3().eth.defaultAccount))
        await actions.addProject(params);
      } 
      
      if (subAction === 'View Project') {
        let params = (await menus.viewProject())
        await actions.viewProject(params);
      } 
      
      if (subAction === 'Fund a Project') {
        let params = (await menus.donate())
        await actions.donate(params);
      }
    } else if(action === 'Pledges') {
      subAction = (await menus.pledges()).action

      if (subAction === 'View Pledges') {
        await actions.viewPledges();
      }
    } else if (action === 'Funders') {
      subAction = (await menus.funders()).action

      if (subAction === 'List Funders') {
        await actions.listFunders();
      } if (subAction === 'Create Funder') {
        let params = (await menus.createFunder())
        await actions.addGiver(params);
      }
    } else if (action === 'Tokens') {
      subAction = (await menus.tokens()).action

      if (subAction === 'Mint') {
        let params = (await menus.mintToken())
        await actions.mintToken(params);
      } if (subAction === 'Approve') {
        let params = (await menus.approveToken())
        await actions.approveToken(params);
      }
    } else if (action === 'Exit') {
      process.exit()
    } else {
      console.dir("unknown action: " + action)
    }
    resolve();
  });
}

async function app(actions) {
  console.dir("### Liquid Funding Console")
  while (true) {
    await mainMenu(actions);
  }
}

module.exports = app;
