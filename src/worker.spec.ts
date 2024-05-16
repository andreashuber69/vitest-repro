// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";
import Worker from "web-worker";

const bounce = async (worker: Worker, val: boolean) => {
    let currentResolve: ((value: boolean) => void) | undefined;

    const handler = (ev: MessageEvent<boolean>) => {
        currentResolve?.(ev.data);
        worker.removeEventListener("message", handler);
    }

    return await new Promise<boolean>((resolve) => {
        currentResolve = resolve;
        worker.addEventListener("message", handler);
        worker.postMessage(val);
    });
}

describe("Worker", () => {
    it("should bounce back", async () => {
        const worker = new Worker(new URL("worker.js", import.meta.url), { type: "module" });
        expect(await bounce(worker, true)).toBe(true);
        expect(await bounce(worker, false)).toBe(false);
    });
});
