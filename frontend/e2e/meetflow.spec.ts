import { test, expect } from '@playwright/test';

test.describe('MeetFlow E2E Mobile Coordination Flow', () => {
  test('User can register, submit travel, offer carpool, message cohort, toggle privacy, and export', async ({ page }) => {
    // 1. Visit the Join / Registration page
    await page.goto('/event/nlp-meetup-2026/join');
    await expect(page.locator('h2')).toContainText('Participant Registration');

    // Fill registration form
    await page.fill('input[placeholder="e.g. NLP2026"]', 'NLP2026');
    await page.fill('input[placeholder="Enter your full name"]', 'E2E Tester');
    
    // Use a unique mobile number to avoid conflict with seeded data
    const uniquePhone = '+919' + Math.floor(100000000 + Math.random() * 900000000).toString();
    await page.fill('input[placeholder="e.g. +919876543210"]', uniquePhone);
    await page.fill('input[placeholder="name@email.com"]', 'e2e@example.com');
    await page.fill('input[placeholder="Batch of 2018"]', 'Cohort 2026');
    
    // Choose city from select
    await page.selectOption('select', 'Bangalore');

    // Click "Continue to Privacy Choices"
    await page.click('button:has-text("Continue to Privacy Choices")');
    await expect(page.locator('h3:has-text("Visibility Settings")')).toBeVisible();

    // Click "Confirm Register"
    await page.click('button:has-text("Confirm Register")');
    
    // 2. Travel Plan Form submission
    await page.waitForURL('**/travel');
    await expect(page.locator('h1:has-text("Submit Travel Plan")')).toBeVisible();
    
    // Fill pickup location and travel mode
    await page.fill('input[placeholder="e.g. Kondapur, Whitefield"]', 'Koramangala Block 3');
    
    // Choose travel mode: own_car
    // The second select is the travel mode select (first is city)
    await page.locator('select').nth(1).selectOption('own_car');
    
    await page.fill('textarea[placeholder*="boarding points"]', 'Driving my SUV, have space for luggage');
    await page.click('button:has-text("Save Travel Plan")');

    // 3. Carpool board page
    await page.waitForURL('**/carpool');
    await expect(page.locator('h1')).toContainText('Carpool Coordination Board');
    
    // Click "Offer Ride"
    await page.click('button:has-text("Offer Ride")');
    await expect(page.locator('h3:has-text("Create Carpool Pool")')).toBeVisible();
    
    // Fill Offer Ride form
    await page.fill('input[placeholder="e.g. Ramesh\'s Morning SUV Express"]', 'E2E SUV Express');
    await page.fill('input[placeholder="e.g. Gachibowli, Outer Ring Road"]', 'Koramangala Outer Ring Road');
    await page.fill('textarea[placeholder*="Where to coordinate"]', 'Meet near Sony Signal at 6 AM');
    
    // Publish
    await page.click('button:has-text("Publish Carpool Offer")');
    
    // Confirm carpool card is visible on screen
    await expect(page.locator('h3:has-text("E2E SUV Express")').first()).toBeVisible();

    // 4. Message Coordination Board
    await page.click('a[href*="/messages"]');
    await page.waitForURL('**/messages');
    await expect(page.locator('h1:has-text("Meetup Chat & Broadcasts")')).toBeVisible();
    
    // Post general coordination message
    await page.fill('textarea[placeholder*="What\'s happening"]', 'Hello cohort, excited to drive from Bangalore!');
    await page.click('button[title="Post Message"]');
    await expect(page.locator('p:has-text("Hello cohort, excited to drive from Bangalore!")')).toBeVisible();

    // Post announcement warning popup gate test
    await page.selectOption('select', 'Announcement');
    await page.fill('textarea[placeholder*="What\'s happening"]', 'Announcement: Meetup location has a welcome banner posted!');
    await page.click('button[title="Post Message"]');
    
    // Assert modal warning popup is visible
    await expect(page.locator('h3:has-text("Broadcast Announcement?")')).toBeVisible();
    
    // Click Broadcast
    await page.click('button:has-text("Yes, Broadcast")');
    await expect(page.locator('p:has-text("Announcement: Meetup location has a welcome banner posted!")')).toBeVisible();

    // 5. Settings / Profile Privacy Toggles
    await page.click('a[href*="/settings"]');
    await page.waitForURL('**/settings');
    await expect(page.locator('h1:has-text("My Profile Settings")')).toBeVisible();
    
    // Click Privacy Tab
    await page.click('button:has-text("Privacy & Toggles")');
    
    // Toggle "Display Mobile Number" checkbox
    await page.click('text=Display Mobile Number');
    await page.click('button:has-text("Save Privacy Preferences")');
    await expect(page.locator('text=Privacy configurations saved!')).toBeVisible();

    // 6. Exports page verification
    await page.goto('/event/nlp-meetup-2026/export');
    await page.waitForURL('**/export');
    await expect(page.locator('h1:has-text("Export Data Center")')).toBeVisible();

    // Verify CSV export link triggers successfully
    const downloadPromise1 = page.waitForEvent('download');
    await page.locator('button:has-text("Download CSV")').first().click();
    const download1 = await downloadPromise1;
    expect(download1.suggestedFilename()).toContain('participants');
  });
});
