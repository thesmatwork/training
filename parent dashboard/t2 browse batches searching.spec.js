import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');

  await page.getByRole('textbox', { name: 'Email or Phone Number' }).click();
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).fill('saiprasanna@gmail.com');
  await page.getByRole('button', { name: 'Continue →' }).click();

  await page.getByRole('textbox', { name: 'Password' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Password' }).fill('R');
  await page.getByRole('textbox', { name: 'Password' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Password' }).fill('Reset123');

  await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeEnabled({
    timeout: 60000
  });

  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  await page.getByRole('link', { name: 'Browse Batches' }).click();

  const searchBox = page.getByRole('textbox', {
    name: 'Search batches, teachers...'
  });

  await expect(searchBox).toBeVisible({ timeout: 60000 });

  await searchBox.click();
  await searchBox.fill('music');

  await page.waitForTimeout(3000);

  await expect(page.getByText(/Showing \d+ batch/)).toBeVisible();
});