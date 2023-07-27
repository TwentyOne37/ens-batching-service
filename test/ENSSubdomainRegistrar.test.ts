import { ethers } from "hardhat";
import { Signer } from "ethers";
import chai from "chai";
import { ENSSubdomainRegistrar } from "../typechain-types/contracts/ENSSubdomainRegistrar";
import { ENS } from "../typechain-types/@ensdomains/ens-contracts/contracts/registry/ENS";
import { Resolver } from "../typechain-types/@ensdomains/ens-contracts/contracts/resolvers/Resolver";

import { FakeContract, smock } from "@defi-wonderland/smock";

chai.use(smock.matchers);

describe("ENSSubdomainRegistrar", () => {
  let ensSubdomainRegistrar: ENSSubdomainRegistrar;
  let owner: Signer;
  let addr1: Signer;
  let ownerAddress: string;
  let addr1Address: string;
  let fakeENS: FakeContract<ENS>;
  let fakeResolver: FakeContract<Resolver>;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    addr1Address = await addr1.getAddress();

    // Set up the ENS Mock
    fakeENS = await smock.fake<ENS>("ENS");
    // Set up the Resolver Mock
    fakeResolver = await smock.fake<Resolver>("Resolver");

    const ensSubdomainRegistrarFactory = await ethers.getContractFactory(
      "ENSSubdomainRegistrar",
      owner
    );

    ensSubdomainRegistrar = (await ensSubdomainRegistrarFactory.deploy(
      fakeENS.address, // Get the address of the mocked contract
      fakeResolver.address // Get the address of the mocked contract
    )) as ENSSubdomainRegistrar;
  });

  describe("registerBatchSubdomains", () => {
    it("should register batch subdomains", async () => {
      const nodes = [
        ethers.utils.namehash("cryptom.app"),
        ethers.utils.namehash("cryptom.app"),
      ];
      const labels = [
        ethers.utils.id("merchant1"),
        ethers.utils.id("merchant2"),
      ];
      const owners = [ownerAddress, addr1Address];

      const result = await ensSubdomainRegistrar.registerBatchSubdomains(
        nodes,
        labels,
        owners
      );

      // Assert that setSubnodeRecord was called with correct arguments
      // await expect(result)
      //   .to.emit(fakeENS, "NewOwner")
      //   .withArgs(nodes[0], labels[0], owners[0]);

      // await expect(result)
      //   .to.emit(fakeENS, "NewOwner")
      //   .withArgs(nodes[1], labels[1], owners[1]);

      // // Assert that setAddr was called with correct arguments
      // await expect(result)
      //   .to.emit(fakeResolver, "AddrChanged")
      //   .withArgs(ethers.utils.namehash("merchant1.cryptom.app"), owners[0]);

      // await expect(result).to.emit(fakeResolver, "AddrChanged");
    });
  });
});
