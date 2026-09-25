import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');

  await page.getByRole('textbox', { name: 'Email or Phone Number' }).fill('SriLaxmi@gmail.com');
  await page.getByRole('button', { name: 'Continue →' }).click();

  await page.getByRole('textbox', { name: 'Password' }).fill('Reset123');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  await page.getByRole('link', { name: 'Attendance' }).click();

  await page.getByRole('combobox').selectOption('course_816ae5e3');

  await page.getByRole('button', { name: 'Mark All Present' }).click();
  await page.getByRole('button', { name: 'Clear All' }).click();

  await page.getByRole('button', { name: 'Present' }).nth(1).click();
  await page.getByRole('button', { name: 'Present' }).nth(2).click();
  await page.getByRole('button', { name: 'Present' }).nth(3).click();
  await page.getByRole('button', { name: 'Present' }).nth(4).click();

  await page.getByRole('button', { name: 'Late' }).nth(4).click();

  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Save Anyway' }).click();
});