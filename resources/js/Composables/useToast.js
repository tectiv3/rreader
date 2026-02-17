import { ref } from 'vue';

const toasts = ref([]);
let nextId = 0;

export function useToast() {
    function show(message, type = 'info', duration = 3000) {
        const id = nextId++;
        toasts.value.push({ id, message, type, leaving: false });

        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }

        return id;
    }

    function dismiss(id) {
        const toast = toasts.value.find(t => t.id === id);
        if (toast) {
            toast.leaving = true;
            setTimeout(() => {
                toasts.value = toasts.value.filter(t => t.id !== id);
            }, 300);
        }
    }

    function success(message, duration = 3000) {
        return show(message, 'success', duration);
    }

    function error(message, duration = 4000) {
        return show(message, 'error', duration);
    }

    function info(message, duration = 3000) {
        return show(message, 'info', duration);
    }

    return { toasts, show, dismiss, success, error, info };
}
