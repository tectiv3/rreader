import { ref, watch, onMounted } from 'vue';

const isDark = ref(true);

export function useDarkMode() {
    function applyTheme() {
        if (isDark.value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    function toggle() {
        isDark.value = !isDark.value;
    }

    onMounted(() => {
        const stored = localStorage.getItem('rreader-dark-mode');
        if (stored !== null) {
            isDark.value = stored === 'true';
        }
        applyTheme();
    });

    watch(isDark, (val) => {
        localStorage.setItem('rreader-dark-mode', String(val));
        applyTheme();
    });

    return { isDark, toggle };
}
