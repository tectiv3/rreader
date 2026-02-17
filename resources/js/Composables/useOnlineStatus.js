import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
const lastOnlineAt = ref(isOnline.value ? new Date() : null);

let listenerCount = 0;

function handleOnline() {
    isOnline.value = true;
    lastOnlineAt.value = new Date();
}

function handleOffline() {
    isOnline.value = false;
}

export function useOnlineStatus() {
    onMounted(() => {
        if (listenerCount === 0) {
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
        }
        listenerCount++;
    });

    onUnmounted(() => {
        listenerCount--;
        if (listenerCount === 0) {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        }
    });

    return { isOnline, lastOnlineAt };
}
