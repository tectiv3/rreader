function postToSW(message) {
    window.__swReady?.then(sw => {
        if (sw) sw.postMessage(message);
    });
}

function requestFromSW(message) {
    return new Promise((resolve) => {
        if (!window.__swReady) {
            resolve(null);
            return;
        }
        window.__swReady.then(sw => {
            if (!sw) {
                resolve(null);
                return;
            }
            let settled = false;
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => {
                if (!settled) {
                    settled = true;
                    channel.port1.close();
                    resolve(event.data);
                }
            };
            sw.postMessage(message, [channel.port2]);
            setTimeout(() => {
                if (!settled) {
                    settled = true;
                    channel.port1.close();
                    resolve(null);
                }
            }, 500);
        });
    });
}

export function useReadingState() {
    function saveReadingState(state) {
        postToSW({ type: 'save-reading-state', state });
    }

    function clearReadingState() {
        postToSW({ type: 'clear-reading-state' });
    }

    async function loadReadingState() {
        return requestFromSW({ type: 'get-reading-state' });
    }

    return { saveReadingState, clearReadingState, loadReadingState };
}
