import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.getByRole('textbox', { name: 'Email or Phone Number' }).fill('saiprasanna@gmail.com');
  await page.getByRole('button', { name: 'Continue →' }).click();

  await page.getByRole('textbox', { name: 'Password' }).fill('Reset123');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  await page.getByRole('link', { name: 'Reviews & Feedback' }).click();

  await page.waitForTimeout(5000);

  console.log('URL:', page.url());
  console.log('Links:', await page.getByRole('link').allTextContents());
  console.log('Buttons:', await page.getByRole('button').allTextContents());
});