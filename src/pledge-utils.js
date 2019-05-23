const Table = require('cli-table');

const getPledges = async (LiquidPledging) => {
  let numPledges = await LiquidPledging.methods.numberOfPledges().call();
  let pledges = [];
  let pledgeAdmins = [];
  for(let i = 1; i <= numPledges; i++){
    pledges.push(LiquidPledging.methods.getPledge(i).call());
  }
  pledges = await Promise.all(pledges);
  for(let i = 0; i < pledges.length; i++){
    pledges[i].id = i+1;
    pledgeAdmins.push(LiquidPledging.methods.getPledgeAdmin(pledges[i].owner).call())
  }

  pledgeAdmins = await Promise.all(pledgeAdmins);
  for(let i = 0; i < pledges.length; i++){
    pledges[i].ownerData = pledgeAdmins[i];
  }

  return pledges;
}

const PledgeState = {
  '0': "Pledged",
  '1': "Paying",
  '2': "Paid"
};


const printTable = (pledges, web3) => {
  const table = new Table({
    head: ['Id', 'Owner', 'Token', 'Amount', 'nDelegates', 'IntededProject (?)', 'Commit Time (?)',  'Old Pledge Id', 'Pledge State']
  });
  for(let i =  pledges.length - 1; i >= 0; i--){
    table.push(
      [pledges[i].id, `${pledges[i].owner} (${pledges[i].ownerData.name})`, pledges[i].token, web3.utils.fromWei(pledges[i].amount, "ether"), pledges[i].nDelegates, pledges[i].intendedProject, pledges[i].commitTime, pledges[i].oldPledge, PledgeState[pledges[i].pledgeState]]
    );
  }
  console.log(table.toString());
};



module.exports = {
  getPledges,
  printTable
};
