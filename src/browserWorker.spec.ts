import { describe, expect, it } from "vitest";

const bounce = async (worker: Worker, value: boolean) => {
    let currentResolve: (value: boolean) => void;
    let currentReject: (reason?: unknown) => void;

    const onMessage = (message: MessageEvent<boolean>) => {
        remove();
        currentResolve(message.data);
    };

    const onError = (err: ErrorEvent) => {
        remove();
        currentReject(err);
    };

    const remove = () => {
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
    };

    return await new Promise<boolean>((resolve, reject) => {
        currentResolve = resolve;
        currentReject = reject;
        worker.addEventListener("message", onMessage);
        worker.addEventListener("error", onError);
        worker.postMessage(value);
    });
}

describe("Worker", () => {
    it("should bounce back", async () => {
        const worker = new Worker(new URL("browserWorker.js", import.meta.url), { type: "module" });
        expect(await bounce(worker, true)).toBe(true);
        expect(await bounce(worker, false)).toBe(false);
    });
});
