import { ref } from 'vue'

const isAddFeedModalOpen = ref(false)
const initialTab = ref('feed')
const initialUrl = ref('')

export function useAddFeedModal() {
    const openAddFeedModal = (tab = 'feed', url = '') => {
        initialTab.value = tab
        initialUrl.value = url
        isAddFeedModalOpen.value = true
    }

    const closeAddFeedModal = () => {
        isAddFeedModalOpen.value = false
        initialTab.value = 'feed'
        initialUrl.value = ''
    }

    return {
        isAddFeedModalOpen,
        initialTab,
        initialUrl,
        openAddFeedModal,
        closeAddFeedModal,
    }
}
