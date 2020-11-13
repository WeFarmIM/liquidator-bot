import { AccountGetter } from './AccountGetter';
import { logger } from './logger';
import { isAccountLiquidatable, borrowBalance } from '../helper/contractsHelper';
import { Web3Wrapper } from '../helper/web3';

export class FakeAccountGetter extends AccountGetter {

    constructor(accounts: string[], updateFreqSec: number, user: string, liquidatorToken: string, web3Wrapper: Web3Wrapper) {
        super(updateFreqSec, liquidatorToken, user, web3Wrapper);
        this.accounts = accounts;
    }

    async initialize() {
        // Do nothing now.
    }

    start() {
        logger.info({
            at: 'FakeAccountGetter#start',
            message: 'Starting FakeAccountGetter'
        });
        this.runUpdateAccounts();
    }

    getAllAccounts() {
        return this.accounts;
    }

    getLiquidatableAccounts() {
        return this.liquidatableAccounts;
    }

    async runUpdateAccounts() {

    }

    async runUpdateLiquidatableAccounts() {
        for (; ;) {
            if (this.killed) return;
            this.liquidatableAccounts = [];

            try {
                for (let account of this.accounts) {
                    const liquidatableStatus = await isAccountLiquidatable(account, this.user, this.web3Wrapper.getWeb3());
                    const balance = await borrowBalance(this.liquidatorToken, account, this.user, this.web3Wrapper.getWeb3());
                    // Should have borrowed some tokens in liquidatorToken for the borrower.
                    if (liquidatableStatus && balance) {
                        this.liquidatableAccounts.push(account);
                    }
                }
            } catch (err) {
                logger.error({
                    at: 'FakeAccountGetter#runUpdateAccounts',
                    message: err.message
                });
            }

            logger.info({
                at: 'FakeAccountGetter#runUpdateAccounts',
                message: "Finish one round of runUpdateAccounts"
            });
            await this.wait(this.updateFreqSec);
        }
    }
}