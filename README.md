# ERC725

The ERC725 project implements the ERC725 standard, serving as a generic executor and key-value store. This repository includes the ERC725X executor, ERC725Y will be added soon. The [AA](https://github.com/0xAdnanH/AA/tree/master) repository uses ERC725X and ERC725Y as a base for an account based contract.

## Goals of the Project

The primary goals of the ERC725 project are to:

- **Explore Function Call Encoding with ethers.js:** The project dive into the encoding of function calls using `ethers.js`. The `execute` functions uses bytes to execute functions on other addresses, which makes the understanding of the encoding process essential.

- **Understand Delegatecall with Practical Examples:** The project provides practical examples of using `delegatecall`. By employing delegate calls to mock contracts, the project showcases how changes written within a delegate-called contract affect the caller contract. These examples contribute to a better understanding of the delegatecall mechanism.

## Technicalities of the Project

- **Ether.js Tests Organization:** The project organizes its unit tests using the `describe` and `it` blocks within `ethers.js`, enhancing the readability and structure of the test suite.

- **Usage of Array Functions:** The project employs array functions to enhance code readability and maintainability, making the codebase more efficient.

## Installation

### Cloning the Repository

You can clone the repository and install its dependencies to start using the provided smart contracts.

```bash
$ git clone https://github.com/0xAdnanH/ERC725.git
$ cd ./ERC725
$ npm install
```

### Instructions

#### Compile

To Compile the contract run:

```bash
$ npx hardhat compile
```

#### Tests

To run the unit tests:

```bash
$ npx hardhat test
```
