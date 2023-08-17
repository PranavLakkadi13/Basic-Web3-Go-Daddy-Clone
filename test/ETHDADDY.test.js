const { assert, expect } = require("chai");
const { deployments, ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
};

describe("ETH Daddy Test", function () {
    let ETHDADDY;
    let deployer;
    let accounts;

    const NAME = "ETH Daddy";
    const SYMBOL = "DAD";

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["ETHDaddy"]);
        ETHDADDY = await ethers.getContract("ETHDaddy",deployer);
    });

    describe("checks the constructor/state variables the name and symbol", () => {
        it("checks the name", async () => {
            const name = await ETHDADDY.name();
            assert.equal(name, NAME);
        });
        it("checks the symbol", async () => {
            const symbol = await ETHDADDY.symbol();
            assert.equal(symbol, SYMBOL);
        });
        it("checks the owner of the contract", async () => {
            const owner = await ETHDADDY.getOwner();
            assert.equal(owner, deployer);
        });
    })

    describe("List function", () => {
        it("Checks the listing", async () => {
            await ETHDADDY.List("", tokens("0.25"));
        });
        it("checks the domain data being stored correctly ", async () => {
            await ETHDADDY.List("", tokens("0.25"));
            const domain = await ETHDADDY.getDomainMapping("0");
            expect(domain.isOwned).to.equal(false);
        });
        it("checks the listing owner mapping being updated", async () => {
            await ETHDADDY.List("", tokens("0.25"));
            const bal = await ETHDADDY.getListingOwnersCost(deployer);
            expect(bal).to.equal(BigInt(tokens("0.25")));
        });
        it("after listing tokens the token counter increases", async () => {
            await ETHDADDY.List("", tokens("0.25"));
            expect(await ETHDADDY.getListedDomainsCount()).to.equal("1");
        })
    });

    describe("Mint function", () => {
        it("Fails to mint when insufficient value sent", async () => {
            const list = await ETHDADDY.List("", tokens("0.25"));
            await expect(
                ETHDADDY.Mint("0")
            ).to.be.revertedWithCustomError(
                ETHDADDY,
                "ETHDaddy__InsufficientFundsSent"
            );
        });
        it("Fails to mint bcoz teh token was already minted", async () => {
            await ETHDADDY.List("", tokens("0.25"));
            const mint = await ETHDADDY.Mint("0", { value: tokens("0.25") });
            await expect(
              ETHDADDY.Mint("0", { value: tokens("0.25") })
            ).to.be.revertedWithCustomError(
              ETHDADDY,
              "ETHDaddy__AlreadyMinted"
            );
        });
        it("Fails because of the token id to mint is invalid, i.e not listed ", async () => {
            await expect(
              ETHDADDY.Mint("0", { value: tokens("0.25") })
            ).to.be.revertedWithCustomError(
              ETHDADDY,
              "ETHDaddy__InvalidTokenId"
            );
        })
        it("Mints the nft", async () => {
            await ETHDADDY.List("", tokens("0.25"));
            const mint = await ETHDADDY.Mint("0", { value: tokens("0.25") });
            assert(mint);
            const balance = await ethers.provider.getBalance(ETHDADDY.getAddress());
            assert.equal(balance, tokens("0.25"));
        });
        it("checks the domain status after being minted", async () => {
            const list = await ETHDADDY.List("", tokens("0.25"));
            const mint = await ETHDADDY.Mint("0", { value: tokens("0.25") });
            const domain = await ETHDADDY.getDomainMapping("0");
            assert.equal(domain.isOwned, true);
        });
        it("updates the minted domain counter after the nft is minted", async () => {
            const list = await ETHDADDY.List("", tokens("0.25"));
            const mint = await ETHDADDY.Mint("0", { value: tokens("0.25") });
            const count = await ETHDADDY.getMintedDomainsCount();
            assert.equal(count, "1");
        });
    })

    describe('Withdraw function', () => {
        it("expects the withdraw function to fail when no token is minted", async () => {
            await expect(ETHDADDY.Withdraw()).to.be.revertedWithCustomError(
                ETHDADDY,
                "ETHDaddy__NotValidOwner"
            );
        });
        it("withdraw 0 balance case since nft is listed but not minted", async () => {
            await ETHDADDY.List("", tokens("0.25"));
            await expect(ETHDADDY.Withdraw()).to.be.revertedWithCustomError(
              ETHDADDY,
              "ETHDaddy__DomainNotMinted"
            );
        });
        it("The test passes when a valid listee calls ", async () => {
            const list = await ETHDADDY.List("", tokens("0.25"));
            const mint = await ETHDADDY.connect(accounts[1]).Mint("0", { value: tokens("0.25") });
            await ETHDADDY.Withdraw();
            assert.equal(await ETHDADDY.getBalance(), "0");
        });
        it("Checks the updated listing owner cost mapping", async () => {
            const list = await ETHDADDY.List("", tokens("0.25"));
            const mint = await ETHDADDY.connect(accounts[1]).Mint("0", {
              value: tokens("0.25"),
            });
            await ETHDADDY.Withdraw();
            expect(await ETHDADDY.getListingOwnersCost(deployer)).to.equal("0");
        })
    })
    
})