import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');

  await page.getByRole('textbox', { name: 'Email or Phone Number' }).fill('saiprasanna@gmail.com');
  await page.getByRole('button', { name: 'Continue →' }).click();

  await page.getByRole('textbox', { name: 'Password' }).fill('Reset123');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  await page.getByRole('link', { name: 'Payments' }).click();
  await page.getByRole('button', { name: 'Proceed' }).first().click();
  await page.getByRole('button', { name: 'Paid already? — Upload' }).click();
  await page.getByRole('button', { name: 'Upload Payment Screenshot' }).click();

  await page.locator('input[type="file"]').setInputFiles(
    String.raw`C:\Users\kdeepthi\Pictures\Screenshots\images (2).jpg`
  );

  await page.getByRole('button', { name: '🟣 PhonePe' }).click();
  await page.getByText('Step 2 of 3 — Confirm Payment').click();
  await page.getByRole('button', { name: 'Verify →' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
});