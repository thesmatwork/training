import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.getByRole('textbox', {
    name: 'Email or Phone Number'
  }).fill('SriLaxmi@gmail.com');

  await page.getByRole('button', {
    name: 'Continue →'
  }).click();

  await page.getByRole('textbox', {
    name: 'Password'
  }).fill('Reset123');

  await page.getByRole('button', {
    name: 'Sign In',
    exact: true
  }).click();

  await page.getByRole('link', {
    name: 'Events'
  }).click();

  await page.locator('div').filter({
    hasText: '💃Dance CompetetionPastDance'
  }).nth(5).click();

  await page.getByRole('button', {
    name: 'Madhu1Vasu'
  }).click();

  await page.getByRole('button', {
    name: 'Manu3Test3'
  }).click();
});