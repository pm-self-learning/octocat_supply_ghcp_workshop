Feature: Supplier directory discovery
  As a supply chain planner
  I want to browse and search the supplier directory from the navigation bar
  So that I can quickly find and evaluate suppliers for procurement decisions

  Scenario: Navigate from the home page to the supplier directory
    Given I am on the home page
    When I select the Suppliers navigation link
    Then I land on the suppliers page
    And I see the page header "Suppliers"

  Scenario: All suppliers are listed on the suppliers page
    Given I am viewing the supplier directory
    Then I can see supplier cards for known suppliers
    And each card displays the supplier name

  Scenario: Search for a supplier by name
    Given I am viewing the supplier directory
    And the directory includes "PurrTech Innovations"
    When I search for "PurrTech"
    Then the results show "PurrTech Innovations"
    And the contact person is visible in the card

  Scenario: Search for a supplier by contact person
    Given I am viewing the supplier directory
    When I search for "Felix"
    Then the results show "PurrTech Innovations"

  Scenario: Search for a supplier by email
    Given I am viewing the supplier directory
    When I search for "whiskerware"
    Then the results show "WhiskerWare Systems"

  Scenario: Search for a supplier with no matches
    Given I am viewing the supplier directory
    When I search for "Galactic Meow Corp"
    Then I see the empty state message "No suppliers found"
    And I am prompted to adjust the search filters

  Scenario: Active and verified badges are displayed
    Given I am viewing the supplier directory
    Then the "PurrTech Innovations" card shows an "Active" badge
    And the "PurrTech Innovations" card shows a "Verified" badge

  Scenario: Clearing the search restores all suppliers
    Given I am viewing the supplier directory
    When I search for "PurrTech"
    And I clear the search input
    Then all suppliers are visible again
