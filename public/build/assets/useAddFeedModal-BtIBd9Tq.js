import { p as l } from './app-CwD7sToY.js'
const e = l(!1),
    d = l('feed'),
    a = l('')
function i() {
    return {
        isAddFeedModalOpen: e,
        initialTab: d,
        initialUrl: a,
        openAddFeedModal: (o = 'feed', n = '') => {
            ;((d.value = o), (a.value = n), (e.value = !0))
        },
        closeAddFeedModal: () => {
            ;((e.value = !1), (d.value = 'feed'), (a.value = ''))
        },
    }
}
export { i as u }
