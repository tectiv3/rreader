import { ref, watch, computed, onMounted, onUnmounted } from 'vue';

// Read stored theme synchronously at module load to prevent flash
function getInitialTheme() {
    if (typeof localStorage === 'undefined') return 'dark';
    const stored = localStorage.getItem('rreader-theme');
    if (stored && ['dark', 'light', 'system'].includes(stored)) return stored;
    // Migrate from old boolean key
    const oldStored = localStorage.getItem('rreader-dark-mode');
    if (oldStored !== null) {
        const migrated = oldStored === 'true' ? 'dark' : 'light';
        localStorage.setItem('rreader-theme', migrated);
        localStorage.removeItem('rreader-dark-mode');
        return migrated;
    }
    return 'dark';
}

const theme = ref(getInitialTheme());

function resolveIsDark() {
    if (theme.value === 'system') {
        return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme.value === 'dark';
}

// Apply immediately at module load to prevent flash
function applyTheme() {
    if (typeof document === 'undefined') return;
    if (resolveIsDark()) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
applyTheme();

const isDark = computed(() => resolveIsDark());

export function useDarkMode() {
    let mediaQuery = null;
    let mediaHandler = null;

    function toggle() {
        theme.value = isDark.value ? 'light' : 'dark';
    }

    function setTheme(value) {
        theme.value = value;
    }

    onMounted(() => {
        applyTheme();
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaHandler = () => {
            if (theme.value === 'system') {
                applyTheme();
            }
        };
        mediaQuery.addEventListener('change', mediaHandler);
    });

    onUnmounted(() => {
        if (mediaQuery && mediaHandler) {
            mediaQuery.removeEventListener('change', mediaHandler);
        }
    });

    watch(theme, (val) => {
        localStorage.setItem('rreader-theme', val);
        applyTheme();
    });

    return { isDark, theme, toggle, setTheme };
}
