<template>
  <UPage>
    <UPageHeader class="mb-8">
      <template #title>
        <div class="flex items-center gap-3">
          <span class="text-3xl font-bold">Welcome to Nuxt UI</span>
          <UBadge color="primary" variant="subtle" size="lg">v4</UBadge>
        </div>
      </template>
      <template #description>
        <p class="text-lg mt-2">A modern UI library for Nuxt with Tailwind CSS v4</p>
      </template>
    </UPageHeader>

    <UPageBody>
      <UContainer class="py-8">
        <div class="space-y-8">
          <!-- Featured Card -->
          <UCard class="mb-8">
            <template #header>
              <h3 class="text-xl font-bold text-primary-500">Primary Themed Card</h3>
            </template>

            <p class="text-base text-gray-700 dark:text-gray-300">
              Content with custom typography and proper spacing
            </p>

            <template #footer>
              <UButton color="primary" variant="solid" size="lg">
                Action
              </UButton>
            </template>
          </UCard>

          <!-- Feature Grid -->
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold">Getting Started</h3>
              </template>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
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
              <p class="text-gray-600 dark:text-gray-400 mb-4">
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
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Customize your app's appearance with powerful theming capabilities.
              </p>
              <template #footer>
                <UButton color="primary" variant="soft" block>
                  Customize
                </UButton>
              </template>
            </UCard>
          </div>

          <!-- Alert Section -->
          <UAlert
            color="primary"
            variant="subtle"
            title="Ready to start building?"
            description="Check out the documentation to learn more about Nuxt UI components and features."
          />
        </div>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
