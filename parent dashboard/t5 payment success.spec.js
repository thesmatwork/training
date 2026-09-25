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

  await page.getByRole('link', { name: 'Payments' }).click();

  await page.getByRole('combobox').first().selectOption('c_f36e9c1e');
  await page.getByRole('combobox').nth(1).selectOption('2026-10');

  await page.getByRole('button', { name: 'Proceed' }).first().click();

  // Wait until the payment section is actually rendered
  const uploadButton = page.locator('button:visible').filter({
    hasText: 'Paid already?'
  });

  await expect(uploadButton).toBeVisible({ timeout: 30000 });
  await uploadButton.click();

  await page.getByRole('button', { name: 'Upload Payment Screenshot' }).click();

  await page.locator('input[type="file"]').setInputFiles(
    'C:\\Users\\kdeepthi\\Pictures\\Screenshots\\images (3).jpg'
  );

  await page.getByRole('button', { name: '🟣 PhonePe' }).click();

  await expect(
    page.getByRole('button', { name: 'Verify →' })
  ).toBeEnabled({ timeout: 30000 });

  await page.getByRole('button', { name: 'Verify →' }).click();

});