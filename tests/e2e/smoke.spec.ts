import { expect, test } from '@playwright/test';

test('renders the miniapp shell', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#root > *').first()).toBeVisible();
});
