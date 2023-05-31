import router from 'next/router'

export function navigateBack() {
  const prev = sessionStorage.getItem('prevPath')
  if (prev) {
    router.back()
  } else {
    void router.push('/')
  }
}