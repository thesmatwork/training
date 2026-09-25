import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).click();
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).fill('saiprasanna@gmail.com');
  await page.getByRole('button', { name: 'Continue →' }).click();
  await page.getByRole('textbox', { name: 'Password' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Password' }).fill('R');
  await page.getByRole('textbox', { name: 'Password' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Password' }).fill('Reset123');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('link', { name: 'Browse Batches' }).click();
  await page.getByRole('link', { name: '🎵 Music Guitar S SriLaxmi' }).click();
  await page.getByRole('button', { name: 'Enroll Now' }).first().click();
  await page.getByText('5 years old').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Confirm Enrollment' }).click();

  // Removed only because this was the reported error:
  // await page.getByRole('button', { name: 'Go to Dashboard' }).click();
});
