import { test, expect } from '@playwright/test';

/**
 * Contact Us form E2E tests
 * Implements: frontend/tests/features/contact-us.feature
 *
 * Covers:
 * - Navigation to Contact Us page
 * - Valid form submission with success message
 * - Form validation for required fields
 * - Email format validation
 * - Message minimum length validation
 */

test.describe('Contact Us form submission', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate away from about:blank so localStorage context is available
    await page.goto('/');
  });

  test('Navigate to the Contact Us page from navigation', async ({ page }) => {
    // Given I am on the home page
    await page.goto('/');
    await expect(page.locator('h1:has-text("Smart Cat Tech")')).toBeVisible();

    // When I click the "Contact" navigation link
    await page.click('nav a:has-text("Contact")');

    // Then I land on the Contact Us page
    await expect(page).toHaveURL(/\/contact/);

    // And I see the heading "Contact Us"
    await expect(page.locator('h1:has-text("Contact Us")')).toBeVisible();
  });

  test('Submit a valid contact form', async ({ page }) => {
    // Given I am on the Contact Us page
    await page.goto('/contact');
    await expect(page.locator('h1:has-text("Contact Us")')).toBeVisible();

    // When I fill in the name field with "John Doe"
    await page.fill('input[name="name"]', 'John Doe');

    // And I fill in the email field with "john@example.com"
    await page.fill('input[name="email"]', 'john@example.com');

    // And I fill in the subject field with "Product Inquiry"
    await page.fill('input[name="subject"]', 'Product Inquiry');

    // And I fill in the message field with "I would like to know more about your products"
    await page.fill('textarea[name="message"]', 'I would like to know more about your products');

    // And I submit the form
    await page.click('button[type="submit"]');

    // Then I see a success message "Thank you for contacting us!"
    const successMessage = page.locator('[role="alert"]').filter({ hasText: 'Thank you for contacting us!' });
    await expect(successMessage).toBeVisible();

    // And the form is cleared
    await expect(page.locator('input[name="name"]')).toHaveValue('');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
    await expect(page.locator('input[name="subject"]')).toHaveValue('');
    await expect(page.locator('textarea[name="message"]')).toHaveValue('');
  });

  test('Validate required name field', async ({ page }) => {
    // Given I am on the Contact Us page
    await page.goto('/contact');
    await expect(page.locator('h1:has-text("Contact Us")')).toBeVisible();

    // When I leave the name field empty
    // (name field is already empty by default)

    // And I submit the form
    await page.click('button[type="submit"]');

    // Then I see a validation error "Name is required"
    const nameError = page.locator('#name-error');
    await expect(nameError).toBeVisible();
    await expect(nameError).toHaveText('Name is required');

    // And the form is not submitted (no success message)
    const successMessage = page.locator('[role="alert"]').filter({ hasText: 'Thank you for contacting us!' });
    await expect(successMessage).not.toBeVisible();
  });

  test('Validate email format', async ({ page }) => {
    // Given I am on the Contact Us page
    await page.goto('/contact');
    await expect(page.locator('h1:has-text("Contact Us")')).toBeVisible();

    // When I fill in the name field with "John Doe"
    await page.fill('input[name="name"]', 'John Doe');

    // And I fill in the email field with "invalid-email"
    await page.fill('input[name="email"]', 'invalid-email');

    // And I submit the form
    await page.click('button[type="submit"]');

    // Then I see a validation error "Please enter a valid email address"
    const emailError = page.locator('#email-error');
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText('Please enter a valid email address');

    // And the form is not submitted (no success message)
    const successMessage = page.locator('[role="alert"]').filter({ hasText: 'Thank you for contacting us!' });
    await expect(successMessage).not.toBeVisible();
  });

  test('Validate required message field', async ({ page }) => {
    // Given I am on the Contact Us page
    await page.goto('/contact');
    await expect(page.locator('h1:has-text("Contact Us")')).toBeVisible();

    // When I fill in the name field with "John Doe"
    await page.fill('input[name="name"]', 'John Doe');

    // And I fill in the email field with "john@example.com"
    await page.fill('input[name="email"]', 'john@example.com');

    // And I leave the message field empty
    // (message field is already empty by default)

    // And I submit the form
    await page.click('button[type="submit"]');

    // Then I see a validation error "Message is required"
    const messageError = page.locator('#message-error');
    await expect(messageError).toBeVisible();
    await expect(messageError).toHaveText('Message is required');

    // And the form is not submitted (no success message)
    const successMessage = page.locator('[role="alert"]').filter({ hasText: 'Thank you for contacting us!' });
    await expect(successMessage).not.toBeVisible();
  });

  test('Validate message minimum length', async ({ page }) => {
    // Given I am on the Contact Us page
    await page.goto('/contact');
    await expect(page.locator('h1:has-text("Contact Us")')).toBeVisible();

    // When I fill in the name field with "John Doe"
    await page.fill('input[name="name"]', 'John Doe');

    // And I fill in the email field with "john@example.com"
    await page.fill('input[name="email"]', 'john@example.com');

    // And I fill in the message field with "Hi"
    await page.fill('textarea[name="message"]', 'Hi');

    // And I submit the form
    await page.click('button[type="submit"]');

    // Then I see a validation error "Message must be at least 10 characters"
    const messageError = page.locator('#message-error');
    await expect(messageError).toBeVisible();
    await expect(messageError).toHaveText('Message must be at least 10 characters');

    // And the form is not submitted (no success message)
    const successMessage = page.locator('[role="alert"]').filter({ hasText: 'Thank you for contacting us!' });
    await expect(successMessage).not.toBeVisible();
  });
});
