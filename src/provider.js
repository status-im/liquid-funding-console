const async = require('async');
const Web3 = require('web3');
const bip39 = require("bip39");
const hdkey = require('ethereumjs-wallet/hdkey');
const ethUtil = require('ethereumjs-util');
const Transaction = require('ethereumjs-tx');

class Provider {

  constructor() {
    this.accounts = []
    this.addresses = []
    this.nonceCache = {};
    this.web3 = new Web3();
  }

  initAccounts(accounts) {
    for (let accountConfig of accounts) {
      if (accountConfig.mnemonic) {
        const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(accountConfig.mnemonic.trim()));

        const addressIndex = accountConfig.addressIndex || 0;
        const numAddresses = accountConfig.numAddresses || 1;
        const wallet_hdpath = accountConfig.hdpath || "m/44'/60'/0'/0/";

        for (let i = addressIndex; i < addressIndex + numAddresses; i++) {
          const wallet = hdwallet.derivePath(wallet_hdpath + i).getWallet();
          //if (returnAddress) {
          //  this.accounts.push(wallet.getAddressString());
          //} else {
            this.accounts.push(this.web3.eth.accounts.privateKeyToAccount('0x' + wallet.getPrivateKey().toString('hex')));
          //}
        }
      }
    }
  }

  startWeb3Provider(type, web3Endpoint, accountIndex) {
    const self = this;

    if (type === 'rpc') {
      self.provider = new this.web3.providers.HttpProvider(web3Endpoint);
    } else if (type === 'ws') {
      // Note: don't pass to the provider things like {headers: {Origin: "embark"}}. Origin header is for browser to fill
      // to protect user, it has no meaning if it is used server-side. See here for more details: https://github.com/ethereum/go-ethereum/issues/16608
      // Moreover, Parity reject origins that are not urls so if you try to connect with Origin: "embark" it gives the following error:
      // << Blocked connection to WebSockets server from untrusted origin: Some("embark") >>
      // The best choice is to use void origin, BUT Geth rejects void origin, so to keep both clients happy we can use http://embark
      self.provider = new this.web3.providers.WebsocketProvider(web3Endpoint, {
        headers: {Origin: "http://embark"},
        // TODO remove this when Geth fixes this: https://github.com/ethereum/go-ethereum/issues/16846
        clientConfig: {
          fragmentationThreshold: 81920
        }
      });
      self.provider.on('error', () => console.error('Websocket Error'));
      self.provider.on('end', () => console.error('Websocket connection ended'));
    } else {
    }

    self.web3.setProvider(self.provider);

    self.accounts.forEach(account => {
      self.addresses.push(account.address || account);
      if (account.privateKey) {
        self.web3.eth.accounts.wallet.add(account);
      }
    });
    self.addresses = [...new Set(self.addresses)]; // Remove duplicates

    if (self.accounts.length) {
      self.web3.eth.defaultAccount = self.addresses[accountIndex || 0];
    }

    const realSend = self.provider.send.bind(self.provider);

    self.runTransaction = async.queue(({payload}, callback) => {
      const rawTx = payload.params[0];
      const rawData = Buffer.from(ethUtil.stripHexPrefix(rawTx), 'hex');
      const tx = new Transaction(rawData, 'hex');
      const address = '0x' + tx.getSenderAddress().toString('hex').toLowerCase();

      self.getNonce(address, (newNonce) => {
        tx.nonce = newNonce;
        const key = ethUtil.stripHexPrefix(self.web3.eth.accounts.wallet[address].privateKey);
        const privKey = Buffer.from(key, 'hex');
        tx.sign(privKey);
        payload.params[0] = '0x' + tx.serialize().toString('hex');
        return realSend(payload, (error, result) => {
          self.web3.eth.getTransaction(result.result, () => {
            callback(error, result);
          });
        });
      });
    }, 1);

    self.provider.send = function(payload, cb) {
      if (payload.method === 'eth_accounts') {
        return realSend(payload, function(err, result) {
          if (err) {
            return cb(err);
          }
          if (self.accounts.length) {
            result.result = self.addresses;
          }
          cb(null, result);
        });
      } else if (payload.method === "eth_sendRawTransaction") {
        return self.runTransaction.push({payload}, cb);
      }

      realSend(payload, cb);
    };
  }

  getNonce(address, callback) {
    this.web3.eth.getTransactionCount(address, (_error, transactionCount) => {
      if(this.nonceCache[address] === undefined) {
        this.nonceCache[address] = -1;
      }

      if (transactionCount > this.nonceCache[address]) {
        this.nonceCache[address] = transactionCount;
        return callback(this.nonceCache[address]);
      }

      this.nonceCache[address]++;
      callback(this.nonceCache[address]);
    });
  }

}

module.exports = Provider;
