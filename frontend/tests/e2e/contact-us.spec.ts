import { expect, test } from '@playwright/test';

/**
 * Contact page E2E tests
 * Implements: frontend/tests/features/contact-us.feature
 */

test.describe('Contact page', () => {
  test('Navigate to the contact page from the main navigation', async ({ page }) => {
    // Given I am on the home page
    await page.goto('/');
    await expect(page.locator('h1:has-text("Smart Cat Tech")')).toBeVisible();

    // When I select the Contact us navigation link
    await page.click('nav a:has-text("Contact us")');

    // Then I land on the contact page
    await expect(page).toHaveURL(/\/contact/);

    // And I see the heading "Let's plan your next cat tech rollout"
    await expect(page.locator('h1:has-text("Let\'s plan your next cat tech rollout")')).toBeVisible();
  });

  test('Submit a contact request', async ({ page }) => {
    // Given I am viewing the contact page
    await page.goto('/contact');
    await expect(page.locator('h1:has-text("Let\'s plan your next cat tech rollout")')).toBeVisible();

    // When I submit a contact request
    await page.getByLabel('Name').fill('Taylor Planner');
    await page.getByLabel('Email').fill('taylor@example.com');
    await page.getByLabel('Company').fill('Whisker Retail Group');
    await page.getByLabel('Subject').fill('Store rollout support');
    await page
      .getByLabel('Message')
      .fill('Please contact us about stocking smart feeders across our stores.');
    await page.getByRole('button', { name: 'Send Message' }).click();

    // Then I see the confirmation message "Thanks for reaching out. An OctoCAT specialist will contact you soon."
    await expect(page.getByRole('status')).toContainText(
      'Thanks for reaching out. An OctoCAT specialist will contact you soon.'
    );
  });
});
