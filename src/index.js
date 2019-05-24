var program = require('commander');
var cmd = require('./cmd.js');
const Actions = require('./actions.js');

program
  .version('0.1.0')
  .option('-u, --url [url]', "host to connect to (default: ws://localhost:8556)")
  .option('-a, --accounts [accounts]', "accounts file, if not defined uses accounts in the connecting node")
  .option('-c, --chain [chain]', "environment to run, can be mainnet, ropsten, development (default: development)")
  .option('-i, --index [index]', "account index to use (default: 0)")
  .parse(process.argv);

let accounts = [];
if (program.accounts) {
  accounts = require(process.cwd() + "/" + program.accounts).accounts;
}

const actions = new Actions(program.chain || "development", accounts || []);

actions.connect({
  url: (program.url || "ws://localhost:8556"),
  accountIndex: (program.index || 0)
}, async () => {
  cmd(actions)
});

