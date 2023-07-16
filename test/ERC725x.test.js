const { expect } = require("chai");
const { ethers } = require("hardhat");

let address;
let address1;
let address2;
let address3;
let address4;
let ERC725Xcontract;
let Numcontract;
let moneyContract;

before(async () => {
  [address, address1, address2, address3, address4] = await ethers.getSigners();
  const NumContractFactory = await ethers.getContractFactory("Num");
  Numcontract = await NumContractFactory.deploy();

  const ERC725ContractFactory = await ethers.getContractFactory("ERC725X");
  ERC725Xcontract = await ERC725ContractFactory.connect(address).deploy();

  const moneyContractFactory = await ethers.getContractFactory("money");
  moneyContract = await moneyContractFactory.deploy();
});

describe("Testing ERC725X Contract", () => {
  describe("Testing execute function", () => {
    const valueToSend = 500;
    const dataToSend = "0x1122";

    it("should call address successfully", async () => {
      const operationType = 0;
      await expect(
        ERC725Xcontract.connect(address).execute(
          operationType,
          address1.address,
          valueToSend,
          dataToSend,
          { value: 500 }
        )
      )
        .to.emit(ERC725Xcontract, "Executed")
        .withArgs(operationType, address1.address, valueToSend, dataToSend);
    });
  });

  describe("testing executeBatch", () => {
    const valueToSend = [10, 100, 1000];
    const dataToSend = ["0x1111", "0x2222", "0x3333"];
    it("should revert if operation type is bigger than 5", async () => {
      const operationType = [5, 6, 6];
      const target = [address4.address, address2.address, address3.address];
      await expect(
        ERC725Xcontract.connect(address).executeBatch(
          operationType,
          target,
          valueToSend,
          dataToSend,
          { value: 1110 }
        )
      ).to.be.revertedWith("Op greater than 4");
    });
    it("should call address successfully", async () => {
      const operationType = [0, 0, 0];
      const target = [address1.address, address2.address, address3.address];
      expect(
        ERC725Xcontract.connect(address).executeBatch(
          operationType,
          target,
          valueToSend,
          dataToSend,
          {
            value: 1110,
          }
        )
      )
        .to.emit(ERC725Xcontract, "Executed")
        .withArgs(operationType[0], target[0], valueToSend[0], dataToSend[0]);
    });
  });
  describe("Sending value to money contract", () => {
    it("should send value to money contract", async () => {
      const valueToSend = 100;
      await expect(
        ERC725Xcontract.connect(address).execute(
          0,
          moneyContract,
          valueToSend,
          "0x",
          { value: 100 }
        )
      ).to.emit(moneyContract, "received");
    });
    it("should revert if data was sent", async () => {
      const valueToSend = 100;
      await expect(
        ERC725Xcontract.connect(address).execute(
          0,
          moneyContract,
          valueToSend,
          "0x1122"
        )
      ).to.be.reverted;
    });
    it("should revert if money and data was sent ", async () => {
      const valueToSend = 100;
      await expect(
        ERC725Xcontract.connect(address).execute(
          0,
          moneyContract,
          valueToSend,
          "0x1122",
          { value: 100 }
        )
      ).to.be.reverted;
    });
    it("should pass if no money and data was sent", async () => {
      const valueToSend = 0;
      await expect(
        ERC725Xcontract.connect(address).execute(
          0,
          moneyContract,
          valueToSend,
          "0x",
          { value: 0 }
        )
      ).to.emit(moneyContract, "received");
    });
  });
});
describe("Testing calls", () => {
  it("should call the funtion incrementCount succesfully", async () => {
    let ABI = ["function incrementCount()"];
    let iface = new ethers.Interface(ABI);
    const payload = iface.encodeFunctionData("incrementCount");
    const target = Numcontract.address;
    const valueToSend = 10;

    await ERC725Xcontract.connect(address).execute(
      0,
      target,
      valueToSend,
      payload,
      { value: 10 }
    );
    const result = await Numcontract.count();
    expect(result).to.equal(1);
  });
  it("should revert if amount and data was sent to Num contract", async () => {
    const target = Numcontract.address;
    const dataToSend = "0x1111";
    const valueToSend = 100;
    await expect(
      ERC725Xcontract.connect(address).execute(
        0,
        target,
        valueToSend,
        dataToSend,
        { value: 100 }
      )
    ).to.be.reverted;
  });
  it("should pass if count is called by operation 1", async () => {
    let ABI = ["function count()"];
    let iface = new ethers.utils.Interface(ABI);
    const payload = iface.encodeFunctionData("count");
    const target = Numcontract.address;
    const valueToSend = 0;
    const operationType = 1;

    await expect(
      ERC725Xcontract.connect(address).execute(1, target, valueToSend, payload)
    )
      .to.emit(ERC725Xcontract, "Executed")
      .withArgs(operationType, target, valueToSend, payload);
  });
  it("should fail if increment fn is called by operation 1", async () => {
    let ABI = ["function incrementCount()"];
    let iface = new ethers.utils.Interface(ABI);
    const payload = iface.encodeFunctionData("incrementCount");
    const target = Numcontract.address;
    const valueToSend = 0;
    const operationType = 1;
    await expect(
      ERC725Xcontract.connect(address).execute(
        operationType,
        target,
        valueToSend,
        payload
      )
    ).to.be.reverted;
  });

  it("should increment red in ERC725X", async () => {
    let ABI = ["function incrementCount()"];
    let iface = new ethers.utils.Interface(ABI);
    const payload = iface.encodeFunctionData("incrementCount");
    const target = Numcontract.address;
    const valueToSend = 0;
    const operationType = 2;
    await expect(
      ERC725Xcontract.connect(address).execute(2, target, valueToSend, payload)
    )
      .to.emit(ERC725Xcontract, "Executed")
      .withArgs(operationType, target, valueToSend, payload);
    const result = await ERC725Xcontract.red();
    expect(result).to.equal(1);
  });
  it("should change address of ownable by delegate call", async () => {
    let ABI = ["function setAddress(address _slot0)"];
    let iface = new ethers.utils.Interface(ABI);
    const payload = iface.encodeFunctionData("setAddress", [address4.address]);
    const target = Numcontract.address;
    const operationType = 2;
    const valueToSend = 0;
    await ERC725Xcontract.connect(address).execute(
      2,
      target,
      valueToSend,
      payload
    );
    const result = await ERC725Xcontract.owner();
    expect(result).to.equal(address4.address);
  });

  it("create of new contract with ContractAddress", async () => {
    const operationType = 3;
    const valueToSend = 0;
    const dataToSend =
      "0x608060405234801561001057600080fd5b506102ef806100206000396000f3fe60806040526004361061003f5760003560e01c806306661abd146100445780633850c7bd1461006f578063e30081a01461009a578063e5071b8e146100c3575b600080fd5b34801561005057600080fd5b506100596100cd565b604051610066919061016d565b60405180910390f35b34801561007b57600080fd5b506100846100d3565b60405161009191906101c9565b60405180910390f35b3480156100a657600080fd5b506100c160048036038101906100bc9190610215565b6100f7565b005b6100cb61013a565b005b60015481565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6001600081548092919061014d90610271565b9190505550565b6000819050919050565b61016781610154565b82525050565b6000602082019050610182600083018461015e565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006101b382610188565b9050919050565b6101c3816101a8565b82525050565b60006020820190506101de60008301846101ba565b92915050565b600080fd5b6101f2816101a8565b81146101fd57600080fd5b50565b60008135905061020f816101e9565b92915050565b60006020828403121561022b5761022a6101e4565b5b600061023984828501610200565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061027c82610154565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036102ae576102ad610242565b5b60018201905091905056fea2646970667358221220f618878989c4149fe7d08687cf2e1a18a4376b58fc11de1f93579b69d931e64f64736f6c63430008120033";
    const target = address3;
    await ERC725Xcontract.connect(address4).execute(
      3,
      target.address,
      valueToSend,
      dataToSend
    );
  });
  it("create a new contract by create2", async () => {
    const operationType = 4;
    const valueToSend = 0;
    const dataToSend =
      "0x608060405234801561001057600080fd5b506102ef806100206000396000f3fe60806040526004361061003f5760003560e01c806306661abd146100445780633850c7bd1461006f578063e30081a01461009a578063e5071b8e146100c3575b600080fd5b34801561005057600080fd5b506100596100cd565b604051610066919061016d565b60405180910390f35b34801561007b57600080fd5b506100846100d3565b60405161009191906101c9565b60405180910390f35b3480156100a657600080fd5b506100c160048036038101906100bc9190610215565b6100f7565b005b6100cb61013a565b005b60015481565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6001600081548092919061014d90610271565b9190505550565b6000819050919050565b61016781610154565b82525050565b6000602082019050610182600083018461015e565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006101b382610188565b9050919050565b6101c3816101a8565b82525050565b60006020820190506101de60008301846101ba565b92915050565b600080fd5b6101f2816101a8565b81146101fd57600080fd5b50565b60008135905061020f816101e9565b92915050565b60006020828403121561022b5761022a6101e4565b5b600061023984828501610200565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061027c82610154565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036102ae576102ad610242565b5b60018201905091905056fea2646970667358221220f618878989c4149fe7d08687cf2e1a18a4376b58fc11de1f93579b69d931e64f64736f6c63430008120033";
    const target = address3;
    await ERC725Xcontract.connect(address4).execute(
      operationType,
      target.address,
      valueToSend,
      dataToSend
    );
  });
});
