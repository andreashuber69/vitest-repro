import { Worker, WorkerOptions } from "node:worker_threads";
import { describe, expect, it } from "vitest";

const bounce = async (worker: Worker, value: boolean) => {
    let currentResolve: (value: boolean) => void;
    let currentReject: (reason?: unknown) => void;

    const onMessage = (message: boolean) => {
        remove();
        currentResolve(message);
    };

    const onError = (err: Error) => {
        remove();
        currentReject(err);
    };

    const remove = () => {
        worker.removeListener("message", onMessage);
        worker.removeListener("error", onError);
    };

    return await new Promise<boolean>((resolve, reject) => {
        currentResolve = resolve;
        currentReject = reject;
        worker.addListener("message", onMessage);
        worker.addListener("error", onError);
        worker.postMessage(value);
    });
}

class TsWorker extends Worker {
	constructor(filename: string | URL, options: WorkerOptions = {}) {
		options.workerData ??= {};
		options.workerData.__ts_worker_filename = filename.toString();
		super(new URL("./worker.mjs", import.meta.url), options);
	}
}

describe("Worker", () => {
    it("should bounce back", async () => {
        const worker = new TsWorker(new URL("nodeWorker.ts", import.meta.url));
        expect(await bounce(worker, true)).toBe(true);
        expect(await bounce(worker, false)).toBe(false);
    });
});
