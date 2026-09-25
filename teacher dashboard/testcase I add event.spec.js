import { test, expect } from '@playwright/test';

test('Create Competition Event', async ({ page }) => {
  await page.goto('https://main.d3bswqs7lc5xma.amplifyapp.com/');

  // Login
  await page.getByRole('button', { name: 'Teacher' }).click();

  await page.getByRole('textbox', { name: 'Email or Phone Number' })
    .fill('SriLaxmi@gmail.com');

  await page.getByRole('button', { name: 'Continue →' }).click();

  await page.getByRole('textbox', { name: 'Password' })
    .fill('Reset123');

  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // Events
  await page.getByRole('link', { name: 'Events' }).click();

  await page.getByRole('button', { name: 'New Event' }).click();

  // Event Type
  await page.getByRole('button', { name: '🥇 Competition' }).click();

  // Category
  await page.getByRole('combobox').selectOption('cat_a767053b');

  // Event Name
  await page.getByRole('textbox', { name: 'Event Name *' })
    .fill('the gamer');

  // Date
  await page.getByRole('textbox').nth(2).fill('2026-09-03');
  await page.getByRole('textbox').nth(3).fill('2026-09-03');

  // Time
  await page.locator('input[type="time"]').fill('10:00');

  // Location
  await page.getByRole('textbox', { name: 'Location' })
    .fill('madhura nagar');

  // Fee
  await page.getByRole('spinbutton', { name: '= free' }).fill('0');

  // Eligibility
  await page.getByRole('textbox', { name: 'Eligibility (optional)' })
    .fill('Students');

  // Maximum participants
  await page.getByRole('spinbutton', { name: '=unlimited' })
    .fill('10');

  // Minimum age
  await page.getByRole('spinbutton', { name: 'e.g., 6' })
    .fill('6');

  // Maximum age
  await page.getByRole('spinbutton', { name: 'e.g., 18' })
    .fill('18');

  // Minimum qualification
  await page.getByRole('textbox', { name: 'Min Qualification (optional)' })
    .fill('level 2');

  // Create Event
  await page.getByRole('button', { name: 'Create Event' }).click();
});