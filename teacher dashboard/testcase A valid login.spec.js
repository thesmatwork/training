import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).click();
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).fill('S');
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).fill('Sri');
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).fill('SriL');
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Email or Phone Number' }).fill('SriLaxmi@gmail.com');
  await page.getByRole('button', { name: 'Continue →' }).click();
  await page.getByRole('textbox', { name: 'Password' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Password' }).fill('R');
  await page.getByRole('textbox', { name: 'Password' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Password' }).fill('Reset123');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
});