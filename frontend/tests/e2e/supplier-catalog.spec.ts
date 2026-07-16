import { test, expect } from '@playwright/test';

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
 */

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
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();

    // Wait for the table to load and capture the first supplier name
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    const supplierName = await firstRow.locator('td').first().locator('div').first().textContent();
    const searchTerm = supplierName?.trim().split(' ')[0] ?? '';

    // When I search for a known supplier name
    const searchInput = page.locator('input[aria-label="Search suppliers"]');
    await searchInput.fill(searchTerm);

    // Then the results table shows the matching supplier row
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    const visibleNames = await rows.locator('td').first().allTextContents();
    for (const name of visibleNames) {
      expect(name.toLowerCase()).toContain(searchTerm.toLowerCase());
    }
  });

  test('Filter suppliers by active status', async ({ page }) => {
    // Given I am viewing the supplier catalog
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();

    // When I select "Active" from the status filter
    await page.selectOption('select#status-filter', 'active');

    // Then only active suppliers are shown in the table
    const statusBadges = page.locator('tbody tr td').filter({ hasText: /^(Active|Inactive)$/ });
    const count = await statusBadges.count();
    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toHaveText('Active');
    }
  });

  test('Filter suppliers by verified status', async ({ page }) => {
    // Given I am viewing the supplier catalog
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();

    // When I select "Verified" from the verified filter
    await page.selectOption('select#verified-filter', 'verified');

    // Then only verified suppliers are shown in the table
    const verifiedBadges = page.locator('tbody tr td').filter({ hasText: /^(Verified|Unverified)$/ });
    const count = await verifiedBadges.count();
    for (let i = 0; i < count; i++) {
      await expect(verifiedBadges.nth(i)).toHaveText('Verified');
    }
  });

  test('Combine search and status filters', async ({ page }) => {
    // Given I am viewing the supplier catalog
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();

    // Capture first row name for the search term
    const supplierName = await page
      .locator('tbody tr')
      .first()
      .locator('td')
      .first()
      .locator('div')
      .first()
      .textContent();
    const searchTerm = supplierName?.trim().split(' ')[0] ?? '';

    // When I search for a supplier name and select "Active" from the status filter
    await page.locator('input[aria-label="Search suppliers"]').fill(searchTerm);
    await page.selectOption('select#status-filter', 'active');

    // Then only matching active suppliers appear in the results
    // Either table rows exist and all are Active, or the empty state is shown
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount > 0) {
      const statusBadges = page.locator('tbody tr td').filter({ hasText: /^(Active|Inactive)$/ });
      const badgeCount = await statusBadges.count();
      for (let i = 0; i < badgeCount; i++) {
        await expect(statusBadges.nth(i)).toHaveText('Active');
      }
    } else {
      await expect(page.locator('[role="status"]')).toContainText('No suppliers found');
    }
  });

  test('Search with no matches shows empty state', async ({ page }) => {
    // Given I am viewing the supplier catalog
    await page.goto('/suppliers');
    await expect(page.locator('h1:has-text("Suppliers")')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();

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
