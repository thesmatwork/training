import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/', {
    waitUntil: 'domcontentloaded'
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
    name: 'Fee Collection'
  }).waitFor({ state: 'visible', timeout: 60000 });

  await page.getByRole('link', {
    name: 'Fee Collection'
  }).click();

  await page.getByRole('button', {
    name: 'Mark Paid'
  }).waitFor({ state: 'visible', timeout: 60000 });

  await page.getByRole('button', {
    name: 'Mark Paid'
  }).click();

  await page.getByRole('textbox', {
    name: 'e.g. Cash received on 5 Jul,'
  }).fill('cash received');

  await page.getByRole('button', {
    name: 'Continue'
  }).click();
});