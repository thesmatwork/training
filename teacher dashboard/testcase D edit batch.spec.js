import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.getByRole('textbox', { name: 'Email or Phone Number' }).fill('SriLaxmi@gmail.com');
  await page.getByRole('button', { name: 'Continue →' }).click();

  await page.getByRole('textbox', { name: 'Password' }).fill('Reset123');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  await page.getByRole('link', { name: 'My Batches' }).click();

  await expect(page.getByRole('textbox', { name: 'Search...' })).toBeVisible({ timeout: 30000 });

  await expect(page.getByRole('button', { name: 'Manage' }).nth(1)).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: 'Manage' }).nth(1).click();

  await page.getByRole('button', { name: 'Edit Batch' }).click();

  await page.getByRole('textbox', { name: '= unlimited' }).fill('20');

  await page.getByRole('button', { name: 'Save Changes' }).click();
});