import { test, expect } from '@playwright/test';

/**
 * Supplier directory discovery E2E tests
 * Implements: frontend/tests/features/supplier-search.feature
 *
 * Covers:
 * - Navigation from home page to supplier directory
 * - Listing all suppliers with their details
 * - Supplier search by name, contact person, and email
 * - Search with no matches (empty state)
 * - Active / Verified status badge display
 * - Clearing search restores full list
 */

test.describe('Supplier directory discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Navigate from the home page to the supplier directory', async ({ page }) => {
    // Given I am on the home page
    await expect(page.locator('h1:has-text("Smart Cat Tech")')).toBeVisible();

    // When I select the Suppliers navigation link
    await page.click('nav a:has-text("Suppliers")');

    // Then I land on the suppliers page
    await expect(page).toHaveURL(/\/suppliers/);

    // And I see the page header "Suppliers"
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();
  });

  test('All suppliers are listed on the suppliers page', async ({ page }) => {
    // Given I am viewing the supplier directory
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();

    // Then I can see supplier cards for known suppliers
    await expect(page.locator('h2:has-text("PurrTech Innovations")')).toBeVisible();
    await expect(page.locator('h2:has-text("WhiskerWare Systems")')).toBeVisible();
    await expect(page.locator('h2:has-text("CatNip Creations")')).toBeVisible();

    // And each card displays the supplier name
    const cards = page.locator('div[class*="rounded-lg"][class*="shadow-lg"]');
    await expect(cards).toHaveCount(3);
  });

  test('Search for a supplier by name', async ({ page }) => {
    // Given I am viewing the supplier directory
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();

    // And the directory includes "PurrTech Innovations"
    await expect(page.locator('h2:has-text("PurrTech Innovations")')).toBeVisible();

    // When I search for "PurrTech"
    const searchInput = page.locator('input[aria-label="Search suppliers"]');
    await searchInput.fill('PurrTech');

    // Then the results show "PurrTech Innovations"
    await expect(page.locator('h2:has-text("PurrTech Innovations")')).toBeVisible();

    // And non-matching suppliers are hidden
    await expect(page.locator('h2:has-text("WhiskerWare Systems")')).not.toBeVisible();

    // And the contact person is visible in the card
    await expect(page.locator('text=Felix Whiskerton')).toBeVisible();
  });

  test('Search for a supplier by contact person', async ({ page }) => {
    // Given I am viewing the supplier directory
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();

    // When I search for "Felix"
    const searchInput = page.locator('input[aria-label="Search suppliers"]');
    await searchInput.fill('Felix');

    // Then the results show "PurrTech Innovations"
    await expect(page.locator('h2:has-text("PurrTech Innovations")')).toBeVisible();
    await expect(page.locator('h2:has-text("WhiskerWare Systems")')).not.toBeVisible();
    await expect(page.locator('h2:has-text("CatNip Creations")')).not.toBeVisible();
  });

  test('Search for a supplier by email', async ({ page }) => {
    // Given I am viewing the supplier directory
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();

    // When I search for "whiskerware"
    const searchInput = page.locator('input[aria-label="Search suppliers"]');
    await searchInput.fill('whiskerware');

    // Then the results show "WhiskerWare Systems"
    await expect(page.locator('h2:has-text("WhiskerWare Systems")')).toBeVisible();
    await expect(page.locator('h2:has-text("PurrTech Innovations")')).not.toBeVisible();
  });

  test('Search for a supplier with no matches', async ({ page }) => {
    // Given I am viewing the supplier directory
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();

    // Wait for suppliers to load
    await expect(page.locator('h2:has-text("PurrTech Innovations")')).toBeVisible();

    // When I search for "Galactic Meow Corp"
    const searchInput = page.locator('input[aria-label="Search suppliers"]');
    await searchInput.fill('Galactic Meow Corp');

    // Then I see the empty state message "No suppliers found"
    const emptyState = page.locator('[role="status"]');
    await expect(emptyState).toContainText('No suppliers found');

    // And I am prompted to adjust the search filters
    await expect(emptyState).toContainText(/clearing.*changing.*search filters/i);
  });

  test('Active and Verified badges are displayed', async ({ page }) => {
    // Given I am viewing the supplier directory
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();

    // Then the "PurrTech Innovations" card shows an "Active" badge
    const purrtechCard = page.locator('div[class*="rounded-lg"][class*="shadow-lg"]').filter({
      hasText: 'PurrTech Innovations',
    });
    await expect(purrtechCard.locator('text=Active')).toBeVisible();

    // And the "PurrTech Innovations" card shows a "Verified" badge
    await expect(purrtechCard.locator('text=Verified')).toBeVisible();

    // WhiskerWare is active but not verified
    const whiskerwareCard = page.locator('div[class*="rounded-lg"][class*="shadow-lg"]').filter({
      hasText: 'WhiskerWare Systems',
    });
    await expect(whiskerwareCard.locator('text=Active')).toBeVisible();
    await expect(whiskerwareCard.locator('text=Verified')).not.toBeVisible();
  });

  test('Clearing the search restores all suppliers', async ({ page }) => {
    // Given I am viewing the supplier directory
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();

    const searchInput = page.locator('input[aria-label="Search suppliers"]');

    // When I search for "PurrTech"
    await searchInput.fill('PurrTech');
    await expect(page.locator('h2:has-text("WhiskerWare Systems")')).not.toBeVisible();

    // And I clear the search input
    await searchInput.clear();

    // Then all suppliers are visible again
    await expect(page.locator('h2:has-text("PurrTech Innovations")')).toBeVisible();
    await expect(page.locator('h2:has-text("WhiskerWare Systems")')).toBeVisible();
    await expect(page.locator('h2:has-text("CatNip Creations")')).toBeVisible();
  });
});
