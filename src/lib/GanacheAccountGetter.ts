import { AccountGetter } from "./AccountGetter";
import { Logger } from "./Logger";
import { isAccountLiquidatable, borrowBalance } from "../helper/contractsHelper";
import { Web3Wrapper } from "../helper/Web3Wrapper";

const logger = Logger.getInstance().logger;

export class GanacheAccountGetter extends AccountGetter {
  constructor(
    accounts: string[],
    updateFreqSec: number,
    user: string,
    liquidatorToken: string,
    web3Wrapper: Web3Wrapper,
    address: any
  ) {
    super(updateFreqSec, liquidatorToken, user, web3Wrapper, address);
    this.accounts = accounts;
  }

  async initialize() {
    // Do nothing now.
  }

  /**
   * Call runUpdateAccounts
   */
  start() {
    logger.info({
      at: "FakeAccountGetter#start",
      message: "Starting FakeAccountGetter",
    });
    this.runUpdateAccounts();
  }

  /**
   * Getter for all accounts.
   */
  getAllAccounts() {
    return this.accounts;
  }

  /**
   * Getter for all liquidatable accounts.
   */
  getLiquidatableAccounts() {
    return this.liquidatableAccounts;
  }

  async runUpdateAccounts() {}

  /**
   * Update liquidatable accounts by checking its liquidatable status and borrow balance in target token.
   */
  async updateLiquidatableAccounts() {
    this.liquidatableAccounts = [];
    try {
      for (let account of this.accounts) {
        const liquidatableStatus = await isAccountLiquidatable(
          account,
          this.user,
          this.web3Wrapper.getWeb3(),
          this.address
        );

        const balance = (
          await borrowBalance(this.liquidatorToken, account, this.user, this.web3Wrapper.getWeb3(), this.address)
        ).toString();

        // Should have borrowed some tokens in liquidatorToken for the borrower.
        if (liquidatableStatus && balance != "0") {
          this.liquidatableAccounts.push(account);
        }
      }
    } catch (err: any) {
      logger.error({
        at: "FakeAccountGetter#updateLiquidatableAccounts",
        message: err.message,
      });
    }

    logger.info({
      at: "FakeAccountGetter#updateLiquidatableAccounts",
      message: "Finish one round of runUpdateAccounts",
    });
  }

  /**
   * Start a inifinite loop to update liquidatable accounts.
   */
  async runUpdateLiquidatableAccounts() {
    for (;;) {
      if (this.killed) return;
      await this.updateLiquidatableAccounts();
      await this.wait(this.updateFreqSec);
    }
  }
}
