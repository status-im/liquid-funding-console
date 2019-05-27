# Liquid Funding Console

Command line utility to use Liquid Funding contracts.

![screenshot_1](https://github.com/status-im/liquid-funding-console/raw/master/screenshots/screenshot_1.png)

![screenshot_2](https://github.com/status-im/liquid-funding-console/raw/master/screenshots/screenshot_2.png)

![screenshot_3](https://github.com/status-im/liquid-funding-console/raw/master/screenshots/screenshot_3.png)

# Usage

```
Usage: index [options]

Options:
-V, --version              output the version number
-u, --url [url]            host to connect to (default: ws://localhost:8556)
-a, --accounts [accounts]  accounts file, if not defined uses accounts in the connecting node
-c, --chain [chain]        environment to run, can be mainnet, ropsten, development (default: development)
-i, --index [index]        account index to use (default: 0)
-h, --help                 output usage information
```

# Connecting to a network

The intended chains needs to be specified with `-c`, and the endpoint with `-u`, in the case of using something like infura, an account needs to be specified.

example:

`node src/index.js -c ropsten -u https://ropsten.infura.io/nm12345678 -a "accounts.json"`

# Configuring accounts

create & configure a account json file then pass it as a paramater `-a`

```
{
  "accounts": [
    {
      "mnemonic": "add mnemonic here",
      "numAddresses": 1
    }
  ]
}
```

# Local usage

1. run embark

`npx embark run`

type `devtxs on`

2. run the dapp

`node src/index.js`

# Notes

* The Liquid Funding contract address needs to be approved to withdraw from a token in order to do pledges with that token. This can be done in `Tokens -> Approve`
* `Mint` will work on ropsten, development etc.. if the deployed token supports it.
