import { Worker } from "node:worker_threads";
import { describe, expect, it } from "vitest";

const bounce = async (worker: Worker, value: boolean) => {
    let currentResolve: (value: boolean) => void;
    let currentReject: (reason?: unknown) => void;

    const onMessage = (message: boolean) => {
        remove();
        currentResolve?.(message);
    };

    const onError = (err: Error) => {
        remove();
        currentReject?.(err);
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

describe("Worker", () => {
    it("should bounce back", async () => {
        const worker = new Worker(new URL("nodeWorker.js", import.meta.url));
        // const worker = new Worker(new URL("nodeWorker.ts", import.meta.url), { execArgv: ["--import", "./node_modules/tsx/dist/cli.mjs"] });
        expect(await bounce(worker, true)).toBe(true);
        expect(await bounce(worker, false)).toBe(false);
    });
});
