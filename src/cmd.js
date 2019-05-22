var inquirer = require('inquirer');
const menus = require('./menus.js');

async function app(actions) {
  console.dir("### Liquid Funding Console")
  let action = (await menus.main()).action
  let subAction

  if (action === 'Projects') {
    subAction = (await menus.projects()).action

    if (subAction === 'List Projects') {
      actions.listProjects();
    } if (subAction === 'Create Project') {
      let params = (await menus.createProject(actions.web3().eth.defaultAccount))
      actions.addProject(params);
    } if (subAction === 'View Project') {
      let params = (await menus.viewProject())
      actions.viewProject(params);
    } if (subAction === 'Donate to Project') {
      let params = (await menus.donate())
      actions.donate(params);
    }
  } else if (action === 'Funders') {
    subAction = (await menus.funders()).action

    if (subAction === 'List Funders') {
    } if (subAction === 'Create Funder') {
      let params = (await menus.createProject())
      actions.addProject(params);
    }
  } else if (action === 'Tokens') {
    subAction = (await menus.tokens()).action

    if (subAction === 'Mint') {
      let params = (await menus.mintToken())
      action.mintToken(params);
    } if (subAction === 'Aprove') {
      let params = (await menus.approveToken())
      action.approveToken(params);
    }
  } else if (action === 'Exit') {
    process.exit()
  } else {
    console.dir("unknown action: " + action)
  }
}

module.exports = app;
