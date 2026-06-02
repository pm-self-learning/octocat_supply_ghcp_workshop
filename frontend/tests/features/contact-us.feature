Feature: Contact the OctoCAT Supply team
  As a retail partner
  I want to reach OctoCAT Supply from the website
  So that I can ask questions about products and support

  Scenario: Navigate to the contact page from the main navigation
    Given I am on the home page
    When I select the Contact us navigation link
    Then I land on the contact page
    And I see the heading "Let's plan your next cat tech rollout"

  Scenario: Submit a contact request
    Given I am viewing the contact page
    When I submit a contact request
    Then I see the confirmation message "Thanks for reaching out. An OctoCAT specialist will contact you soon."
