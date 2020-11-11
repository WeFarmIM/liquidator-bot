import { web3 } from './web3';
import { getInstance } from './getContractInstance';
const { BN } = require("@openzeppelin/test-helpers");
import { address } from '../lib/address';

/**
 * Call SavingAccount.liquidate() function.
 * 
 * @param targetAccount - The account that will be liquidated.
 * @param liquidatorAccount - The user's account that tries to liquidate target account.
 * @param tokenName - The target token the user is paying to liquidate target account.
 * @param gasPrice - The gas price of this transaction.
 */
export const liquidate = async (targetAccount: string, liquidatorAccount: string, tokenName: string, gasPrice: number) => {
    const savingAccount = await getInstance("SavingAccount", web3, address['SavingAccount']);
    const tokenAddress = address[tokenName];

    await savingAccount.methods.liquidate(targetAccount, tokenAddress).send({ from: liquidatorAccount, gas: 4000000, gasPrice });
}

/** 
 * Call Accounts.isAccountLiquidatable(account) of DeFiner's protocol.
 * If LTV_account < 0.85 or LTV_account > 0.95 return false, else return true.
 * 
 * @param account - The account that we want to check liquidatable status on.
 * @param caller - The account that we used to send the transaction.
 * @returns - A boolean, whether the current account is liquidatable.
 */
export const isAccountLiquidatable = async (account: string, caller: string) => {
    const Accounts = await getInstance("Accounts", web3, address['Accounts']);
    var status = false;

    // Currently, the design of isAccountLiquidatable function will throw errors if 
    // LTV is larger than 0.95. Actually, this should return false so we catch this error
    // and return false.
    try {
        status = await Accounts.methods.isAccountLiquidatable(account).call({ from: caller });
    } catch (err) {
        // Do nothing
    }

    return status;
}

/**
 * Call SavingAccount.borrow() of DeFiner's protocol.
 * 
 * @remarks
 * This method will only be used in the test
 * 
 * @param account - The account that tries to borrow from DeFiner.
 * @param tokenName - The token that we want to borrow.
 * @param amount - The borrow amount.
 * @param gasPrice - The gas price of the transaction.
 */
export const borrow = async (account: string, tokenName: string, amount: any, gasPrice: number) => {
    const savingAccount = await getInstance("SavingAccount", web3, address['SavingAccount']);
    const tokenAddress = address[tokenName];
    await savingAccount.methods.borrow(tokenAddress, amount).send({ from: account, gas: 1000000, gasPrice });
}

/**
 * Call ERC20.mint().
 * 
 * @remarks
 * This method will only be used in test.
 * 
 * @param account - The account that we want to mint ERC20 token to.
 * @param tokenName - The ERC20 token we want to mint.
 * @param amount - The amount of token to be minted.
 * @param owner - The owner of the ERC20 contract.
 * @param gasPrice - The gas price of the transaction.
 */
export const mint = async (account: string, tokenName: string, amount: any, owner: string, gasPrice: number) => {
    const tokenAddress = address[tokenName];
    const mockERC20 = await getInstance("MockERC20", web3, tokenAddress);
    await mockERC20.methods.transfer(account, amount).send({ from: owner, gasPrice });
    await mockERC20.methods.approve(address['SavingAccount'], amount).send({ from: account, gasPrice });
}

/**
 * 
 * Call SavingAccount.deposit() of DeFiner's protocol.
 * 
 * @remarks
 * This method will only be used in the test.
 * 
 * @param account - The account that tries to deposit to DeFiner.
 * @param tokenName - The token that we want to deposit.
 * @param amount - The deposit amount.
 * @param gasPrice - The gas price of the transaction.
 */
export const deposit = async (account: string, tokenName: string, amount: any, owner: string, gasPrice: number) => {
    const savingAccount = await getInstance("SavingAccount", web3, address['SavingAccount']);
    const tokenAddress = address[tokenName];
    await savingAccount.methods.deposit(tokenAddress, amount).send({ from: account, gas: 1000000, gasPrice });
}

/**
 * Call chainlinkAggregator.updateAnswer().
 * 
 * @remarks
 * This method will only be used in test.
 * 
 * @param tokenName - The token we want to set price.
 * @param updatedPrice - The new price we want to set.
 * @param owner - The owner of the chainlink contract.
 * @param gasPrice - The gas price of the transaction.
 */
export const updatePrice = async (tokenName: string, updatedPrice: any, owner: string, gasPrice: number) => {
    const mockChainLinkForDAI = await getInstance("MockChainLinkAggregator", web3, address['mockChainlinkAggregatorfor' + tokenName]);
    await mockChainLinkForDAI.methods.updateAnswer(updatedPrice).send({ from: owner, gasPrice });
}

/**
 * Call chainlinkAggregator.latestAnswer().
 * 
 * @remarks
 * This method will only be used in tests.
 * 
 * @param tokenName - The token that we want to get price.
 * @param owner - The owner of the chainlink aggregator contract.
 * @returns - The value of the token price.
 */
export const getPrice = async (tokenName: string, owner: string) => {
    const MockChainLinkAggregator = await getInstance("MockChainLinkAggregator", web3, address['mockChainlinkAggregatorfor' + tokenName]);
    return await MockChainLinkAggregator.methods.latestAnswer().call({ from: owner });
}

/**
 * Call Accounts.getBorrowBalanceCurrent()
 * 
 * @param tokenName - The token that we want to check.
 * @param account - The target account's address.
 * @returns The borrowed token of the target account.
 */
export const borrowBalance = async (tokenName: string, account: string) => {
    const Accounts = await getInstance("Accounts", web3, address['Accounts']);
    const tokenAddress = address[tokenName];
    const res = await Accounts.methods.getBorrowBalanceCurrent(tokenAddress, account).call({ from: account });
    return res;
}

/**
 * Call Accounts.getDepositBalanceCurrent()
 * 
 * @param tokenName - The token that we want to check.
 * @param account - The target account's address.
 * @returns The deposited token of the target account.
 */
export const depositBalance = async (tokenName: string, account: string) => {
    const Accounts = await getInstance("Accounts", web3, address['Accounts']);
    const tokenAddress = address[tokenName];
    return await Accounts.methods.getDepositBalanceCurrent(tokenAddress, account).call({ from: account });
}

/**
 * 
 * Call SavingAccount.repay() of DeFiner's protocol.
 * 
 * @remarks
 * This method will only be used in the test.
 * 
 * @param account - The account that tries to repay to DeFiner.
 * @param tokenName - The token that we want to repay.
 * @param amount - The repay amount.
 * @param gasPrice - The gas price of the transaction.
 */
export const repay = async (account: string, tokenName: string, amount: any, gasPrice: number) => {
    const savingAccount = await getInstance("SavingAccount", web3, address['SavingAccount']);
    const tokenAddress = address[tokenName];
    await savingAccount.methods.repay(tokenAddress, amount).send({ from: account, gas: 2000000, gasPrice });
}

/**
 * 
 * Call SavingAccount.withdraw() of DeFiner's protocol.
 * 
 * @remarks
 * This method will only be used in the test.
 * 
 * @param account - The account that tries to withdraw from DeFiner.
 * @param tokenName - The token that we want to withdraw.
 * @param amount - The withdraw amount.
 * @param gasPrice - The gas price of the transaction.
 */
export const withdraw = async (account: string, tokenName: string, amount: any, gasPrice: number) => {
    const savingAccount = await getInstance("SavingAccount", web3, address['SavingAccount']);
    const tokenAddress = address[tokenName];
    await savingAccount.methods.wtihdraw(tokenAddress, amount).send({ from: account, gas: 2000000, gasPrice });
}

/**
 * 
 * Call SavingAccount.withdrawAll() of DeFiner's protocol.
 * 
 * @remarks
 * This method will only be used in the test.
 * 
 * @param account - The account that tries to withdraw all tokens from DeFiner.
 * @param tokenName - The token that we want to withdraw.
 * @param gasPrice - The gas price of the transaction.
 */
export const withdrawAll = async (account: string, tokenName: string, gasPrice: number) => {
    const savingAccount = await getInstance("SavingAccount", web3, address['SavingAccount']);
    const tokenAddress = address[tokenName];
    await savingAccount.methods.withdrawAll(tokenAddress).send({ from: account, gas: 2000000, gasPrice });
}
