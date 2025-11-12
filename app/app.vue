<template>
  <UPage>
    <UPageHeader>
      <template #title>
        <div class="flex items-center gap-3">
          <span>Welcome to Nuxt UI</span>
          <UBadge color="primary" variant="subtle">v4</UBadge>
        </div>
      </template>
      <template #description>
        A modern UI library for Nuxt with Tailwind CSS v4
      </template>
    </UPageHeader>

    <UPageBody>
      <UContainer>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Getting Started</h3>
            </template>
            <p class="text-gray-600 dark:text-gray-400">
              Build beautiful, responsive applications with pre-built components and utilities.
            </p>
            <template #footer>
              <UButton color="primary" block>
                Learn More
              </UButton>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Components</h3>
            </template>
            <p class="text-gray-600 dark:text-gray-400">
              Access a rich collection of accessible and customizable UI components.
            </p>
            <template #footer>
              <UButton color="primary" variant="outline" block>
                View Components
              </UButton>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Theming</h3>
            </template>
            <p class="text-gray-600 dark:text-gray-400">
              Customize your app's appearance with powerful theming capabilities.
            </p>
            <template #footer>
              <UButton color="primary" variant="soft" block>
                Customize
              </UButton>
            </template>
          </UCard>
        </div>

        <UAlert
          class="mt-8"
          color="primary"
          variant="subtle"
          title="Ready to start building?"
          description="Check out the documentation to learn more about Nuxt UI components and features."
        />
      </UContainer>
    </UPageBody>
  </UPage>
</template>
