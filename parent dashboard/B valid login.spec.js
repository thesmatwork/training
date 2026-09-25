import { test, expect } from '@playwright/test';

test('Valid login', async ({ page }) => {
  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');

  await page.getByRole('textbox', { name: 'Email or Phone Number' })
    .fill('saiprasanna@gmail.com');

  await page.getByRole('button', { name: 'Continue →' }).click();

  await page.getByRole('textbox', { name: 'Password' })
    .fill('Reset123');

  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // Verify login was successful
  await expect(page).not.toHaveURL(/login/i);
});