onmessage = async (ev: MessageEvent<boolean>) => {
    postMessage(ev.data);
}

