import { delay } from './Delay';

export default class TaskExecutor {
    killed: boolean;

    constructor() {
        this.killed = false;
    }

    wait = async (time: number) => {
        await delay(time);
    }

    kill = () => {
        this.killed = true;
    }
}