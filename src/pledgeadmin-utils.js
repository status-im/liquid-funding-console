const Table = require('cli-table');

const FUNDER = "0";
const PROJECT = "2";
const printTable = (pledgeAdmins) => {
  const table = new Table({
    head: ['Id', 'Name', 'URL', 'ParentProject', 'Status', 'Commit Time', 'Owner', 'Plugin']
  });

  for(let i = 0; i < pledgeAdmins.length; i++){
    table.push(
      [i, pledgeAdmins[i].name, pledgeAdmins[i].url, pledgeAdmins[i].parentProject, pledgeAdmins[i].canceled ? 'Canceled' : 'Active', pledgeAdmins[i].commitTime, pledgeAdmins[i].addr, pledgeAdmins[i].plugin]
    );
  }

  console.log(table.toString());
};


const getPledgeAdmins = async (LiquidPledging) => {
  let numProjects = await LiquidPledging.methods.numberOfPledgeAdmins().call();
  let pledgeAdmins = [];
  for(let i = 1; i <= numProjects; i++){
    pledgeAdmins.push(LiquidPledging.methods.getPledgeAdmin(i).call());
  }
  return Promise.all(pledgeAdmins);
}


module.exports = {
  printTable,
  getPledgeAdmins,
  constants: {
    FUNDER,
    PROJECT
  }
};
