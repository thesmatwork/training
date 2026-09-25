import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');
  await page.getByText('Parent Teacher').click();
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
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('R');
  await page.getByRole('textbox', { name: 'Password' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Password' }).fill('Reset123');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('link', { name: 'My Batches' }).click();
  await page.getByRole('button', { name: 'Manage' }).nth(1).click();
  await page.getByRole('button', { name: 'Enroll Student' }).click();
  await page.getByRole('textbox', { name: 'Parent\'s Phone Number' }).click();
  await page.getByRole('textbox', { name: 'Parent\'s Phone Number' }).fill('1234567890');
  await page.getByRole('button', { name: 'Search' }).click();
 
  await page.getByRole('button', { name: 'prasanna (3)' }).click();
  await page.getByRole('button', { name: 'Enroll Selected Child' }).click();
});