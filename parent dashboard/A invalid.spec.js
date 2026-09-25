import { test, expect } from '@playwright/test';

test('Invalid password login', async ({ page }) => {
  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');

  await page.getByRole('textbox', { name: 'Email or Phone Number' })
    .fill('saiprasanna@gmail.com');

  await page.getByRole('button', { name: 'Continue →' }).click();

  await page.getByRole('textbox', { name: 'Password' })
    .fill('WrongPassword123');

  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  await expect(page.getByText(/invalid|incorrect|wrong/i)).toBeVisible();
});