function postToSW(message) {
    if (!navigator.serviceWorker?.controller) return;
    navigator.serviceWorker.controller.postMessage(message);
}

function requestFromSW(message) {
    return new Promise((resolve) => {
        if (!navigator.serviceWorker?.controller) {
            resolve(null);
            return;
        }
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => resolve(event.data);
        navigator.serviceWorker.controller.postMessage(message, [channel.port2]);
        // Timeout after 500ms — don't block mount
        setTimeout(() => resolve(null), 500);
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
