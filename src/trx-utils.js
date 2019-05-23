const Spinner = require('cli-spinner').Spinner;

const executeAndWait = async (toSend, account) => {
  const spinner = new Spinner('%s');
  spinner.setSpinnerString(18);
  spinner.start();

  try {
    const estimatedGas = await toSend.estimateGas({from: account});
    const receipt = await toSend.send({from: account, gas: estimatedGas + 10000});

    spinner.stop(true);
    return receipt;
  } catch(error) {
    console.log("Error: ", error.message);
    spinner.stop(true);
  }
}

module.exports = {
  executeAndWait
};
