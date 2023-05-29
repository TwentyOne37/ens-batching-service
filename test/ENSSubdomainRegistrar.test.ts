import { ethers } from "hardhat";
import { Signer } from "ethers";
import chai from "chai";
import sinonChai from "sinon-chai";
import { solidity } from "ethereum-waffle";
import { ENSSubdomainRegistrar } from "../typechain-types/contracts/ENSSubdomainRegistrar";
import { ENSSubdomainRegistrar__factory } from "../typechain-types/factories/contracts/ENSSubdomainRegistrar__factory";
import { ENS } from "../typechain-types/@ensdomains/ens-contracts/contracts/registry/ENS";
import { Resolver } from "../typechain-types/@ensdomains/ens-contracts/contracts/resolvers/Resolver";
import { smock } from "@defi-wonderland/smock";

chai.use(solidity);
chai.use(sinonChai);
const { expect } = chai;

describe("ENSSubdomainRegistrar", () => {
  let ensSubdomainRegistrar: ENSSubdomainRegistrar;
  let owner: Signer;
  let addr1: Signer;
  let ownerAddress: string;
  let addr1Address: string;
  let fakeENS: any;
  let fakeResolver: any;

  beforeEach(async () => {
    // Get the ContractFactory and Signers here.
    [owner, addr1] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    addr1Address = await addr1.getAddress();

    // Fake the ENS and Resolver contracts
    fakeENS = await smock.fake<ENS>("ENS");
    fakeResolver = await smock.fake<Resolver>("Resolver");

    // Pass the fake contract addresses instead
    const ensSubdomainRegistrarFactory = new ENSSubdomainRegistrar__factory(
      owner
    );
    ensSubdomainRegistrar = await ensSubdomainRegistrarFactory.deploy(
      fakeENS.address,
      fakeResolver.address
    );

    // Listen to the Debug event
    const debugFilter = ensSubdomainRegistrar.filters.Debug(null);
    ensSubdomainRegistrar.on(debugFilter, (message) => {
      console.log(message);
    });
  });

  describe("registerSubdomain", () => {
    it("should register subdomain", async () => {
      const node = ethers.utils.namehash("cryptom.app");
      const label = ethers.utils.id("merchant");

      await ensSubdomainRegistrar
        .connect(owner)
        .registerSubdomain(node, label, ownerAddress);

      const expectedNode = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["bytes32", "bytes32"],
          [node, label]
        )
      );

      expect(
        fakeENS.setSubnodeRecord._watchable.callHistory[0].args
      ).to.deep.equal([
        node,
        label,
        ownerAddress,
        fakeResolver.address,
        ethers.BigNumber.from(0),
      ]);
    });
  });
});
