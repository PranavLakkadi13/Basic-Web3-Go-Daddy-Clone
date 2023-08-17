const { network, deployments, ethers } = require("hardhat");

async function list() {
  let ETHDADDY;
  let deployer;
  deployer = (await getNamedAccounts()).deployer;
  ETHDADDY = await ethers.getContractAt(
    "ETHDaddy",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    deployer
  );

  const tokens = (n) => {
    return ethers.parseUnits(n.toString(), "ether");
  };

  const accounts = await ethers.getSigners();  
  const names = [
    "jack.eth",
    "john.eth",
    "henry.eth",
    "cobalt.eth",
    "oxygen.eth",
    "carbon.eth",
  ];
  const costs = [
    tokens(10),
    tokens(25),
    tokens(15),
    tokens(2.5),
    tokens(3),
    tokens(1),
  ];
    
  for (let j = 0; j < costs.length; j++) {
    await ETHDADDY.connect(accounts[j]).List(
        names[j],
        costs[j]
    );
      
    console.log(names[j] + " has been listed!!")
  }
}

list()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
