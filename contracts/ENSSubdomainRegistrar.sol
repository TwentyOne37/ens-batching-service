// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@ensdomains/ens-contracts/contracts/registry/ENS.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/Resolver.sol";

contract ENSSubdomainRegistrar is Ownable {
    ENS public ens;
    Resolver public resolver;

    event Debug(string message);

    constructor(ENS _ens, Resolver _resolver) {
        ens = _ens;
        resolver = _resolver;
    }

    function registerSubdomain(
        bytes32 node,
        bytes32 label,
        address owner
    ) public onlyOwner {
        emit Debug("registerSubdomain called");
        bytes32 subnode = keccak256(abi.encodePacked(node, label));
        ens.setSubnodeRecord(node, label, owner, address(resolver), 0);
        emit Debug("setSubnodeRecord called");
        resolver.setAddr(subnode, owner);
        emit Debug("setAddr called");
    }
}
