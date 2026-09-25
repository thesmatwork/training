import { test, expect } from '@playwright/test';

test('payment mismatch', async ({ page }) => {

  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');

  await page.getByRole('textbox', {
    name: 'Email or Phone Number'
  }).fill('saiprasanna@gmail.com');

  await page.getByRole('button', {
    name: 'Continue →'
  }).click();

  await page.getByRole('textbox', {
    name: 'Password'
  }).fill('Reset123');

  const signInButton = page.getByRole('button', {
    name: 'Sign In',
    exact: true
  });

  await expect(signInButton).toBeEnabled({ timeout: 60000 });
  await signInButton.click();

  await page.getByRole('link', {
    name: 'Payments'
  }).click();

  await page.getByRole('button', {
    name: 'Proceed'
  }).nth(1).click();

  await page.getByRole('button', {
    name: 'Paid already? — Upload'
  }).click();

  await page.getByRole('button', {
    name: 'Upload Payment Screenshot'
  }).click();

  await page.locator('input[type="file"]').setInputFiles(
    'C:\\Users\\kdeepthi\\Pictures\\Screenshots\\EWI9izbWAAQtZ56.jpg'
  );

  await page.waitForTimeout(2000);

  const verifyButton = page.getByRole('button', {
    name: 'Verify →'
  });

  console.log('Verify disabled:', await verifyButton.isDisabled());

  if (await verifyButton.isEnabled()) {
    await verifyButton.click();
    await page.waitForTimeout(3000);
  }

});