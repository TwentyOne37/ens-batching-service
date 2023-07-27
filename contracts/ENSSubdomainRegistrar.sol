// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@ensdomains/ens-contracts/contracts/registry/ENS.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/Resolver.sol";

contract ENSSubdomainRegistrar is Ownable {
    ENS public ens;
    Resolver public resolver;

    // Constructor to accept ENS and Resolver contracts
    constructor(ENS _ens, Resolver _resolver) {
        ens = _ens;
        resolver = _resolver;
    }

    // Internal function to register a single subdomain
    function _registerSubdomain(
        bytes32 node,
        bytes32 label,
        address owner
    ) internal {
        // Compute the keccak256 hash of the packed binary data of the parent node and the label
        // This uniquely represents the subdomain in the ENS system
        bytes32 subnode = keccak256(abi.encodePacked(node, label));

        // Register the subdomain in the ENS system.
        // This function call sets the owner of the subdomain, its resolver, and its TTL (Time to Live, set to 0 here)
        // The `node` is the parent domain, `label` is the subdomain to register
        // `owner` is the address that will own the subdomain, and `resolver` is the address of the resolver contract
        ens.setSubnodeRecord(node, label, owner, address(resolver), 0);

        // Set the Ethereum address that the subdomain should resolve to in the resolver contract
        // The `subnode` is the hash representing the subdomain, and `owner` is the address it should resolve to
        resolver.setAddr(subnode, owner);
    }

    // Function to register multiple subdomains in a batch
    // Takes an array of nodes, labels, and addresses
    function registerBatchSubdomains(
        bytes32[] calldata nodes,
        bytes32[] calldata labels,
        address[] calldata owners
    ) external onlyOwner {
        require(
            nodes.length == labels.length && labels.length == owners.length,
            "Input arrays must be the same length"
        );
        for (uint256 i = 0; i < nodes.length; i++) {
            _registerSubdomain(nodes[i], labels[i], owners[i]);
        }
    }

    // Function to update the resolver for a node
    function setResolver(bytes32 node, address newResolver) external {
        require(msg.sender == ens.owner(node), "Caller is not the owner");
        ens.setResolver(node, newResolver);
    }
}
