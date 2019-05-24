const Spinner = require('cli-spinner').Spinner;

const executeAndWait = async (toSend, account, chain) => {
  return new Promise(async (resolve, reject) => {
    const spinner = new Spinner('%s');
    spinner.setSpinnerString(18);
    spinner.start();

    try {
      const estimatedGas = await toSend.estimateGas({from: account});
      const tx = toSend.send({from: account, gas: estimatedGas + 10000});

      if (chain && chain !== "development") {
        tx.on('transactionHash', (transactionHash) => {
           let network = "";
           if (chain !== "mainnet") {
             network = chain + "."
           }
          console.dir("https://" + network + "etherscan.io/tx/" + transactionHash);
        })
      }

      const receipt = await tx;

      spinner.stop(true);
      return resolve(receipt);
    } catch(error) {
      console.log("Error: ", error.message);
      spinner.stop(true);
    }
    resolve();
  });
}

module.exports = {
  executeAndWait
};
