const { network, ethers } = require("hardhat");

module.exports = async ({getNamedAccounts,deployments}) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();


    const ETHDADDY = await deploy("ETHDaddy", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 1
    })

    console.log(`The address of the contract is ${ETHDADDY.address}`);
}

module.exports.tags = ["all", "ETHDaddy"];