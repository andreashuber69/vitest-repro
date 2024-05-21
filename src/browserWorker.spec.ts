// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";

const bounce = async (worker: Worker, val: boolean) => {
    let currentResolve: ((value: boolean) => void) | undefined;

    const onMessage = (ev: MessageEvent<boolean>) => {
        currentResolve?.(ev.data);
        worker.removeEventListener("message", onMessage);
    }

    return await new Promise<boolean>((resolve) => {
        currentResolve = resolve;
        worker.addEventListener("message", onMessage);
        worker.postMessage(val);
    });
}

describe("Worker", () => {
    it("should bounce back", async () => {
        const worker = new Worker(new URL("browserWorker.js", import.meta.url), { type: "module" });
        expect(await bounce(worker, true)).toBe(true);
        expect(await bounce(worker, false)).toBe(false);
    });
});
