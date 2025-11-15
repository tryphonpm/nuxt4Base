export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()
  
  // Forcer le mode dark si aucune préférence n'a été définie
  if (!localStorage.getItem('nuxt-color-mode')) {
    colorMode.preference = 'dark'
  }
})

