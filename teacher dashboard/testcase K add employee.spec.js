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

  const employees = page.getByRole('link', {
    name: 'Employees'
  });

  await expect(employees).toBeVisible({ timeout: 60000 });
  await employees.click();

  await page.getByRole('button', {
    name: 'Add Employee'
  }).click();

  await page.getByRole('textbox', {
    name: 'Name'
  }).fill('deepthi');

  await page.getByRole('textbox', {
    name: 'Email'
  }).fill('deepthireddy1111@gmail.com');

  await page.getByRole('textbox', {
    name: 'Phone'
  }).fill('8790174213');

  await page.locator('form').getByText('Barathanatyam').click();

  await page.locator('form').getByRole('button', {
    name: 'Add Employee'
  }).click();
});