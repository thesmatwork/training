import { test, expect } from '@playwright/test';

test('Teacher - Create New Batch and Payment Flow', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');

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
    name: 'My Batches'
  }).waitFor({ state: 'visible' });

  await page.getByRole('link', {
    name: 'My Batches'
  }).click();

  await page.getByRole('button', {
    name: 'Add New Batch'
  }).click();

  await page.getByRole('textbox', {
    name: 'Batch Name *'
  }).fill('coders');

  await page.getByRole('button', {
    name: 'Coding'
  }).click();

  await page.getByRole('button', {
    name: 'Sat'
  }).click();

  await page.getByRole('button', {
    name: 'Sun'
  }).click();

  await page.getByRole('textbox').nth(2).fill('10:00');

  const location = page.getByRole('textbox', {
    name: 'Search for your studio or'
  });

  await location.fill('upp');

  await page.waitForTimeout(1000);

  await location.press('ArrowDown');
  await location.press('Enter');

  await page.getByRole('textbox', {
    name: 'Fee (₹) *'
  }).fill('1500');

  await page.getByRole('textbox', {
    name: '= unlimited'
  }).fill('14');

  await page.getByRole('textbox', {
    name: 'e.g.'
  }).fill('4');

  await page.getByRole('button', {
    name: 'Create Batch'
  }).click();

  await page.getByRole('button', {
    name: 'Upgrade to Basic →'
  }).click();

  await page.getByRole('button', {
    name: 'Generate QR code for payment'
  }).click();

  await page.getByRole('link', {
    name: 'Net Banking'
  }).click();

  await page.getByRole('option', {
    name: 'State Bank Of India State'
  }).click();

  await page.getByText('₹').first().click();
});