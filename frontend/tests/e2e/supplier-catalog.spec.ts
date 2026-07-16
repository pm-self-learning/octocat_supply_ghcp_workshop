import { test, expect, Page } from '@playwright/test';

/**
 * Supplier catalog discovery E2E tests
 * Implements: frontend/tests/features/supplier-catalog.feature
 *
 * Covers:
 * - Navigation from home page to supplier catalog
 * - Supplier search by name
 * - Filter by active status
 * - Filter by verified status
 * - Combined search + status filter
 * - Empty state when no suppliers match
 *
 * Seeded suppliers (from api/src/seedData.ts):
 *   1. PurrTech Innovations  – active: true,  verified: true
 *   2. WhiskerWare Systems   – active: true,  verified: false
 *   3. CatNip Creations      – active: false, verified: false
 */

/** Navigate to /suppliers and wait for the table to be ready. */
async function goToSuppliers(page: Page) {
  await page.goto('/suppliers');
  await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();
  await expect(page.locator('tbody tr').first()).toBeVisible();
}

test.describe('Supplier catalog discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Navigate from the home page to the supplier catalog', async ({ page }) => {
    // Given I am on the home page
    await expect(page.locator('h1:has-text("Smart Cat Tech")')).toBeVisible();

    // When I select the Suppliers navigation link
    await page.click('nav a:has-text("Suppliers")');

    // Then I land on the supplier catalog page
    await expect(page).toHaveURL(/\/suppliers/);

    // And I see the catalog header "Suppliers"
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();
  });

  test('Search for a supplier by name', async ({ page }) => {
    // Given I am viewing the supplier catalog
    await goToSuppliers(page);

    // When I search for a known supplier name
    const searchInput = page.locator('input[aria-label="Search suppliers"]');
    await searchInput.fill('PurrTech');

    // Then the results table shows the matching supplier row
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody tr').first()).toContainText('PurrTech Innovations');
  });

  test('Filter suppliers by active status', async ({ page }) => {
    // Given I am viewing the supplier catalog
    await goToSuppliers(page);

    // When I select "Active" from the status filter
    await page.selectOption('select#status-filter', 'active');

    // Then only active suppliers are shown in the table
    // PurrTech and WhiskerWare are active; CatNip Creations is inactive
    const statusBadges = page.locator('tbody tr td').filter({ hasText: /^(Active|Inactive)$/ });
    const count = await statusBadges.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toHaveText('Active');
    }
  });

  test('Filter suppliers by verified status', async ({ page }) => {
    // Given I am viewing the supplier catalog
    await goToSuppliers(page);

    // When I select "Verified" from the verified filter
    await page.selectOption('select#verified-filter', 'verified');

    // Then only verified suppliers are shown in the table
    // Only PurrTech Innovations is verified
    const verifiedBadges = page.locator('tbody tr td').filter({ hasText: /^(Verified|Unverified)$/ });
    const count = await verifiedBadges.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(verifiedBadges.nth(i)).toHaveText('Verified');
    }
  });

  test('Combine search and status filters', async ({ page }) => {
    // Given I am viewing the supplier catalog
    await goToSuppliers(page);

    // When I search for "WhiskerWare" and select "Active" from the status filter
    // WhiskerWare Systems is active, so it should appear
    await page.locator('input[aria-label="Search suppliers"]').fill('WhiskerWare');
    await page.selectOption('select#status-filter', 'active');

    // Then only matching active suppliers appear in the results
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody tr').first()).toContainText('WhiskerWare Systems');
    const statusBadges = page.locator('tbody tr td').filter({ hasText: /^(Active|Inactive)$/ });
    await expect(statusBadges.first()).toHaveText('Active');
  });

  test('Search with no matches shows empty state', async ({ page }) => {
    // Given I am viewing the supplier catalog
    await goToSuppliers(page);

    // When I search for "ZZZUNKNOWNSUPPLIER999"
    const searchInput = page.locator('input[aria-label="Search suppliers"]');
    await searchInput.fill('ZZZUNKNOWNSUPPLIER999');

    // Then I see the empty state message "No suppliers found"
    const emptyState = page.locator('[role="status"]');
    await expect(emptyState).toContainText('No suppliers found');

    // And I am prompted to adjust the search filters
    await expect(emptyState).toContainText(/clearing.*changing.*search filters/i);
  });
});
