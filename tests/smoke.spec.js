const { test, expect } = require('@playwright/test');

test('top pane and nav links render', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#top')).toBeVisible();
  await expect(page.locator('#sidebar-wrapper')).toBeVisible();
  await expect(page.locator('a[data-pane-link="skills"]')).toHaveCount(1);
});
