const Web3 = require('web3');
const fs = require('fs');
const accountsContract = require('../static/contractData/Accounts.json');
// const ACG721 = require('../static/ACG721.json');

const contract20 = {instance: ""};
// const contract721 = {instance: ""};
let web3;
let administrator;

async function connect_to_chain(rpc_provider, protocol) {
    if (typeof web3 !== 'undefined') {
        console.log("API: Connect to an existing web3 provider ...");
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        console.log("API: Set a new web3 provider ...");
        if (protocol == "http") {
            web3 = new Web3(new Web3.providers.HttpProvider(rpc_provider));
        } else if (protocol == "ws") {
            web3 = new Web3(new Web3.providers.WebsocketProvider(rpc_provider));
        }
    }
    // Exception is thrown if the connection failed
    await web3.eth.net.isListening();
    let accounts = await web3.eth.getAccounts();
    administrator = accounts[0];
    console.log("Connected to RPC server, set administrator to ", administrator, "...");
    return web3;
}

async function deploy_new_contracts(rpc_provider, protocol) {
    // Connect to private chain
    await connect_to_chain(rpc_provider, protocol);

    // Generate new contract objects
    const instanceAccounts = new web3.eth.Contract(JSON.parse(accountsContract.abiString), null, {
        data: accountsContract.bytecode
    });

    // Estimate gas required to deploy the contracts
    const trans_estimate_gas = await instanceAccounts.deploy().estimateGas();
    console.log(`gas used to deploy the contract account is ${trans_estimate_gas}`);

    // Deploy the contracts
    const newInstanceAccounts = await instanceAccounts.deploy().send({
        from: administrator,
        gas: Math.floor(trans_estimate_gas * 1.5)
    });


    console.log("Contracts deployed successfully ...\nAccount Contract is deployed at: ",
    newInstanceAccounts.options.address);

    const deployedConfig = {
        server: rpc_provider,
        administrator: administrator,
        address: newInstanceAccounts.options.address,
        // acg721_address: newInstance721.options.address
    };

    const confString = JSON.stringify(deployedConfig);
    await fs.writeFileSync("./static/contractData/accountsDeployConf.json", confString);
    console.log("Write account deployment result to file ...");
}

module.exports = deploy_new_contracts;
