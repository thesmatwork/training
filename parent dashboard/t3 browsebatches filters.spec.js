import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');

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

  await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible({
    timeout: 60000
  });

  await page.getByRole('button', { name: 'Filters' }).click();

  await expect(page.getByRole('combobox').first()).toBeVisible({
    timeout: 60000
  });

  await page.getByRole('combobox').first().selectOption({ label: 'Monday' });

  await page.getByRole('combobox').nth(1).selectOption({ label: 'Most Popular' });
});