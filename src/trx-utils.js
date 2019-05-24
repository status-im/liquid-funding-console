const Spinner = require('cli-spinner').Spinner;

const executeAndWait = web3 => async (toSend, account, chain, gasPrice) => {
  gasPrice = web3.utils.toWei(gasPrice.toString(), "gwei");

  return new Promise(async (resolve, reject) => {
    const spinner = new Spinner('%s');
    spinner.setSpinnerString(18);
    spinner.start();

    try {
      const estimatedGas = await toSend.estimateGas({from: account});
      const tx = toSend.send({from: account, gas: estimatedGas + 10000, gasPrice});

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

const getGasPrice = async (web3) => {
  return web3.utils.fromWei(await web3.eth.getGasPrice(), "gwei");
}

module.exports = {
  executeAndWait,
  getGasPrice
};
