Feature: Contact Us form submission
  As a visitor to the OctoCAT Supply website
  I want to submit a contact form with validation
  So that I can get in touch with the company

  Scenario: Navigate to the Contact Us page from navigation
    Given I am on the home page
    When I click the "Contact" navigation link
    Then I land on the Contact Us page
    And I see the heading "Contact Us"

  Scenario: Submit a valid contact form
    Given I am on the Contact Us page
    When I fill in the name field with "John Doe"
    And I fill in the email field with "john@example.com"
    And I fill in the subject field with "Product Inquiry"
    And I fill in the message field with "I would like to know more about your products"
    And I submit the form
    Then I see a success message "Thank you for contacting us!"
    And the form is cleared

  Scenario: Validate required name field
    Given I am on the Contact Us page
    When I leave the name field empty
    And I submit the form
    Then I see a validation error "Name is required"
    And the form is not submitted

  Scenario: Validate email format
    Given I am on the Contact Us page
    When I fill in the name field with "John Doe"
    And I fill in the email field with "invalid-email"
    And I submit the form
    Then I see a validation error "Please enter a valid email address"
    And the form is not submitted

  Scenario: Validate required message field
    Given I am on the Contact Us page
    When I fill in the name field with "John Doe"
    And I fill in the email field with "john@example.com"
    And I leave the message field empty
    And I submit the form
    Then I see a validation error "Message is required"
    And the form is not submitted

  Scenario: Validate message minimum length
    Given I am on the Contact Us page
    When I fill in the name field with "John Doe"
    And I fill in the email field with "john@example.com"
    And I fill in the message field with "Hi"
    And I submit the form
    Then I see a validation error "Message must be at least 10 characters"
    And the form is not submitted
