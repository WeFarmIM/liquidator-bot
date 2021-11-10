import TaskExecutor from "./TaskExecutor";
import axios from "axios";
import Web3 from "web3";
import { Logger } from "./Logger";

const logger = Logger.getInstance().logger;

export class GasPriceExecutor extends TaskExecutor {
  gasStationUrl: string;
  price: number;
  updateFreqMillisec: number;
  gasPriceMultiplier: number;

  constructor(gasStationUrl: string, price: number, updateFreqMillisec: number, gasPriceMultiplier: number) {
    super();
    this.gasStationUrl = gasStationUrl;
    this.price = price;
    this.updateFreqMillisec = updateFreqMillisec;
    this.gasPriceMultiplier = gasPriceMultiplier;
  }

  /**
   * Call runUpdatePrice
   */
  start = () => {
    logger.info({
      at: "GasUpdateExecutor#start",
      message: "Starting gas update executor",
    });
    this.runUpdatePrice();
  };

  /**
   * Getter fo the latest gas price, in wei.
   */
  getLatestPrice = () => {
    return Web3.utils.toWei(this.price.toString(), "gwei");
  };

  /**
   * Start an infinite loop to update the gas price.
   */
  runUpdatePrice = async () => {
    if (this.killed) return;
    for (;;) {
      try {
        await this.updateGasPrice();
      } catch (err: any) {
        logger.error({
          at: "GasPriceExecutor#runUpdatePrice",
          message: `Failed to update gas price from ${this.gasStationUrl}`,
          error: err.message,
        });
      }

      await this.wait(this.updateFreqMillisec);
    }
  };

  /**
   * Call getGasPriceFromStation to get the newest gas price in gwei.
   *
   * @remark - newPrice is of unit gwei / 10
   */
  updateGasPrice = async () => {
    let newPrice: number;
    try {
      newPrice = await this.getGasPriceFromStation();
    } catch (err: any) {
      logger.error({
        at: "GasPriceExecutor#updateGasPrice",
        message: "Failed to retrieve gas price",
        error: err.message,
      });
      return;
    }

    this.price = (newPrice / 10) * this.gasPriceMultiplier;
    logger.info({
      at: "GasPriceExecutor#updateGasPrice",
      message: `Successfully update price to ${this.price} gwei`,
    });
  };

  /**
   * Get the gas price from gasStationUrl.
   *
   * @remark - The price get straightly from gas station has unit 10 * gwei
   */
  getGasPriceFromStation = async () => {
    logger.info({
      at: "GasPriceExecutor#getGasPrice",
      message: `Fetching fast gas prices`,
    });
    let res = await axios.get(this.gasStationUrl);

    return res.data.fast;
  };
}
