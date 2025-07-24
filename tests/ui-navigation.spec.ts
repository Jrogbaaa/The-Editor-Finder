import { test, expect } from '@playwright/test';

test.describe('UI and Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TV Editor Finder/);
  });

  test.describe('Homepage Layout and Elements', () => {
    test('should display main navigation elements', async ({ page }) => {
      // Check header elements
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('text=TV Editor Finder')).toBeVisible();
      await expect(page.locator('text=Search')).toBeVisible();
      await expect(page.locator('text=Admin')).toBeVisible();
    });

    test('should display search interface', async ({ page }) => {
      // Check search input
      await expect(page.locator('input[placeholder*="TV show"]')).toBeVisible();
      await expect(page.locator('button:has-text("Search")')).toBeVisible();
    });

    test('should display filter sections', async ({ page }) => {
      // Check filter section headers
      await expect(page.locator('text=Genres')).toBeVisible();
      await expect(page.locator('text=Networks & Platforms')).toBeVisible();
      await expect(page.locator('text=Content Types')).toBeVisible();
    });

    test('should display all genre filter buttons', async ({ page }) => {
      const genres = ['News', 'Sports', 'Children', 'Game Show', 'Variety', 'Horror', 'Crime', 'Action', 'Romance', 'Musical', 'Animation'];
      
      for (const genre of genres) {
        await expect(page.locator(`button:has-text("${genre}")`)).toBeVisible();
      }
    });

    test('should display all network filter buttons', async ({ page }) => {
      const networks = ['Netflix', 'HBO', 'Amazon Prime', 'Disney+', 'Hulu', 'NBC', 'ABC', 'FOX', 'AMC', 'USA'];
      
      for (const network of networks) {
        await expect(page.locator(`button:has-text("${network}")`)).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design Tests', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      // Check that main elements are still visible
      await expect(page.locator('input[placeholder*="TV show"]')).toBeVisible();
      await expect(page.locator('button:has-text("Search")')).toBeVisible();
      
      // Filters should be responsive
      await expect(page.locator('text=Genres')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      
      await expect(page.locator('input[placeholder*="TV show"]')).toBeVisible();
      await expect(page.locator('button:has-text("Search")')).toBeVisible();
      await expect(page.locator('text=Genres')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
      
      await expect(page.locator('input[placeholder*="TV show"]')).toBeVisible();
      await expect(page.locator('button:has-text("Search")')).toBeVisible();
      await expect(page.locator('text=Genres')).toBeVisible();
    });
  });

  test.describe('Search Results Display', () => {
    test('should display search results properly', async ({ page }) => {
      // Perform a search that we know has results
      await page.fill('input[placeholder*="TV show"]', 'Breaking Bad');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Check results structure
      await expect(page.locator('[data-testid="results-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      
      // Check editor cards
      const editorCards = page.locator('[data-testid="editor-card"]');
      await expect(editorCards.first()).toBeVisible();
    });

    test('should display editor card information', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Margaret Sixel');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      const editorCard = page.locator('[data-testid="editor-card"]').first();
      
      // Check that editor card contains expected information
      await expect(editorCard.locator('text=Margaret Sixel')).toBeVisible();
      await expect(editorCard).toBeVisible();
    });

    test('should handle loading states', async ({ page }) => {
      // Start a search
      await page.fill('input[placeholder*="TV show"]', 'Drama');
      await page.click('button:has-text("Search")');
      
      // Should show some kind of loading indication (depends on implementation)
      // For now, just check that results eventually appear
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
    });
  });

  test.describe('Editor Profile Navigation', () => {
    test('should navigate to editor profile page', async ({ page }) => {
      // Search for a specific editor
      await page.fill('input[placeholder*="TV show"]', 'Margaret Sixel');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Click on editor card to go to profile
      const editorCard = page.locator('[data-testid="editor-card"]').first();
      await editorCard.click();
      
      // Should navigate to editor profile page
      await expect(page).toHaveURL(/\/editor\/[a-zA-Z0-9]+/);
      
      // Should display editor profile information
      await expect(page.locator('text=Margaret Sixel')).toBeVisible();
    });

    test('should display editor profile sections', async ({ page }) => {
      // Navigate to an editor profile
      await page.fill('input[placeholder*="TV show"]', 'Margaret Sixel');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      const editorCard = page.locator('[data-testid="editor-card"]').first();
      await editorCard.click();
      
      // Check profile sections
      await expect(page.locator('text=Profile')).toBeVisible();
      await expect(page.locator('text=Credits')).toBeVisible();
      await expect(page.locator('text=Awards')).toBeVisible();
    });

    test('should navigate back to search from editor profile', async ({ page }) => {
      // Go to editor profile
      await page.fill('input[placeholder*="TV show"]', 'Margaret Sixel');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      const editorCard = page.locator('[data-testid="editor-card"]').first();
      await editorCard.click();
      
      // Navigate back
      await page.goBack();
      
      // Should be back on search page with previous search intact
      await expect(page.locator('input[placeholder*="TV show"]')).toHaveValue('Margaret Sixel');
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });
  });

  test.describe('Filter Interaction Tests', () => {
    test('should allow filter selection and deselection', async ({ page }) => {
      // Select a filter
      await page.click('button:has-text("Drama")');
      
      // Check that filter is selected (visual feedback)
      const dramaButton = page.locator('button:has-text("Drama")');
      // This test might need adjustment based on actual CSS classes used
      await expect(dramaButton).toHaveClass(/selected|active|bg-blue/);
      
      // Deselect the filter
      await page.click('button:has-text("Drama")');
      
      // Check that filter is deselected
      await expect(dramaButton).not.toHaveClass(/selected|active|bg-blue/);
    });

    test('should allow multiple filter selections', async ({ page }) => {
      // Select multiple filters
      await page.click('button:has-text("Drama")');
      await page.click('button:has-text("Netflix")');
      await page.click('button:has-text("Guild")');
      
      // All should be selected
      await expect(page.locator('button:has-text("Drama")')).toHaveClass(/selected|active|bg-blue/);
      await expect(page.locator('button:has-text("Netflix")')).toHaveClass(/selected|active|bg-blue/);
      await expect(page.locator('button:has-text("Guild")')).toHaveClass(/selected|active|bg-blue/);
    });

    test('should maintain filter selections during search', async ({ page }) => {
      // Select filters
      await page.click('button:has-text("Comedy")');
      await page.click('button:has-text("HBO")');
      
      // Perform search
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 60000 });
      
      // Filters should still be selected
      await expect(page.locator('button:has-text("Comedy")')).toHaveClass(/selected|active|bg-blue/);
      await expect(page.locator('button:has-text("HBO")')).toHaveClass(/selected|active|bg-blue/);
    });
  });

  test.describe('Search Input Functionality', () => {
    test('should accept text input', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="TV show"]');
      
      await searchInput.fill('Breaking Bad');
      await expect(searchInput).toHaveValue('Breaking Bad');
    });

    test('should clear search input', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="TV show"]');
      
      await searchInput.fill('Test Input');
      await searchInput.clear();
      await expect(searchInput).toHaveValue('');
    });

    test('should trigger search on Enter key', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="TV show"]');
      
      await searchInput.fill('Drama');
      await searchInput.press('Enter');
      
      // Should trigger search
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
    });
  });

  test.describe('Admin Panel Access', () => {
    test('should navigate to admin panel', async ({ page }) => {
      await page.click('text=Admin');
      
      // Should navigate to admin page
      await expect(page).toHaveURL(/\/admin/);
      
      // Should display admin panel
      await expect(page.locator('text=Admin Panel')).toBeVisible();
    });

    test('should navigate back from admin panel', async ({ page }) => {
      await page.click('text=Admin');
      await expect(page).toHaveURL(/\/admin/);
      
      // Navigate back to main search
      await page.click('text=Search');
      
      await expect(page).toHaveURL('/');
      await expect(page.locator('input[placeholder*="TV show"]')).toBeVisible();
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load page quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
    });

    test('should handle multiple rapid searches', async ({ page }) => {
      // Perform multiple searches rapidly
      const searches = ['Drama', 'Comedy', 'Action', 'Thriller'];
      
      for (const search of searches) {
        await page.fill('input[placeholder*="TV show"]', search);
        await page.click('button:has-text("Search")');
        
        // Don't wait for full completion, just start next search
        await page.waitForTimeout(500);
      }
      
      // Wait for final search to complete
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Tab through main elements
      await page.keyboard.press('Tab'); // Should focus search input
      await expect(page.locator('input[placeholder*="TV show"]')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Should focus search button
      await expect(page.locator('button:has-text("Search")')).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check for accessibility attributes
      const searchInput = page.locator('input[placeholder*="TV show"]');
      await expect(searchInput).toHaveAttribute('aria-label');
      
      const searchButton = page.locator('button:has-text("Search")');
      await expect(searchButton).toHaveAttribute('aria-label');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // This test would need to simulate network conditions
      // For now, just ensure the page doesn't crash with invalid searches
      await page.fill('input[placeholder*="TV show"]', '!@#$%^&*()');
      await page.click('button:has-text("Search")');
      
      // Should still display some kind of result or error message
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
    });
  });
}); 