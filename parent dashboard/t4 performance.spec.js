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
  await page.getByRole('link', { name: 'Performance' }).click();
  await page.getByRole('combobox').selectOption('c_f36e9c1e');
});