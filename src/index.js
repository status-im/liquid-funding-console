var program = require('commander');
var cmd = require('./cmd.js');
const Actions = require('./actions.js');

program
  .version('0.1.0')
  .option('-u, --url [url]', "host to connect to (default: ws://localhost:8556)")
  .option('-c, --chain [chain]', "environment to run, can be mainnet, ropsten, development (default: development)")
  .parse(process.argv);

const actions = new Actions(program.chain || "development");

actions.connect(program.url || "ws://localhost:8556", async () => {
  cmd(actions)
});

