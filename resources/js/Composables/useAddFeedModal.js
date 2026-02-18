import { ref } from 'vue'

const isAddFeedModalOpen = ref(false)

export function useAddFeedModal() {
    const openAddFeedModal = () => {
        isAddFeedModalOpen.value = true
    }

    const closeAddFeedModal = () => {
        isAddFeedModalOpen.value = false
    }

    return {
        isAddFeedModalOpen,
        openAddFeedModal,
        closeAddFeedModal,
    }
}
