// https://github.com/andreashuber69/kiss-worker/blob/develop/README.md
import { describe, expect, it } from "vitest";
import Worker from "web-worker";

const bounce = async (worker: Worker, val: boolean) => {
    let currentResolve: ((value: boolean) => void) | undefined;
    let currentReject: ((err: unknown) => void) | undefined;

    const onMessage = (ev: MessageEvent<boolean>) => {
        currentResolve?.(ev.data);
        remove();
    }

    const onError = (err: unknown) => {
        currentReject?.(err);
        remove();
    }

    const remove = () => {
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
    }

    return await new Promise<boolean>((resolve, reject) => {
        currentResolve = resolve;
        currentReject = reject;
        worker.addEventListener("message", onMessage);
        worker.addEventListener("error", onError);
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
