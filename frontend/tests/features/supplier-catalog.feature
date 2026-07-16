Feature: Supplier catalog discovery
  As a supply chain planner
  I want to access the supplier list and filter it
  So that I can quickly find and evaluate suppliers

  Scenario: Navigate from the home page to the supplier catalog
    Given I am on the home page
    When I select the Suppliers navigation link
    Then I land on the supplier catalog page
    And I see the catalog header "Suppliers"

  Scenario: Search for a supplier by name
    Given I am viewing the supplier catalog
    When I search for a known supplier name
    Then the results table shows the matching supplier row

  Scenario: Filter suppliers by active status
    Given I am viewing the supplier catalog
    When I select "Active" from the status filter
    Then only active suppliers are shown in the table

  Scenario: Filter suppliers by verified status
    Given I am viewing the supplier catalog
    When I select "Verified" from the verified filter
    Then only verified suppliers are shown in the table

  Scenario: Combine search and status filters
    Given I am viewing the supplier catalog
    When I search for a supplier name and select "Active" from the status filter
    Then only matching active suppliers appear in the results

  Scenario: Search with no matches shows empty state
    Given I am viewing the supplier catalog
    When I search for "ZZZUNKNOWNSUPPLIER999"
    Then I see the empty state message "No suppliers found"
    And I am prompted to adjust the search filters
