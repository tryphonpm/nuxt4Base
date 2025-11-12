export default defineAppConfig({
    ui: {
      colors: {
        primary: 'green',
        neutral: 'slate'
      },
      pageSection: {
        slots: {
          container: 'flex flex-col lg:grid py-4 sm:py-6 lg:py-8 gap-8 sm:gap-16'
        }
      }
    }
  })
  