import { test, expect } from '@playwright/test';

test.describe('Filter-Based Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TV Editor Finder/);
  });

  test.describe('Genre Filter Tests', () => {
    test('should filter by Drama genre', async ({ page }) => {
      // Click Drama genre filter
      await page.click('button:has-text("Drama")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find drama specialists (we know there are 57+)
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should filter by Comedy genre', async ({ page }) => {
      await page.click('button:has-text("Comedy")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should filter by Sci-Fi genre', async ({ page }) => {
      await page.click('button:has-text("Sci-Fi")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should filter by Animation genre', async ({ page }) => {
      await page.click('button:has-text("Animation")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should filter by Thriller genre', async ({ page }) => {
      await page.click('button:has-text("Thriller")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should filter by Reality genre', async ({ page }) => {
      await page.click('button:has-text("Reality")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });
  });

  test.describe('Network Filter Tests', () => {
    test('should filter by Netflix', async ({ page }) => {
      await page.click('button:has-text("Netflix")');
      await page.click('button:has-text("Search")');
      
      // May trigger web search if no local results
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 60000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should filter by HBO', async ({ page }) => {
      await page.click('button:has-text("HBO")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 60000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should filter by Amazon Prime', async ({ page }) => {
      await page.click('button:has-text("Amazon Prime")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 60000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should filter by CBS', async ({ page }) => {
      await page.click('button:has-text("CBS")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 60000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should filter by FOX', async ({ page }) => {
      await page.click('button:has-text("FOX")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 60000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });
  });

  test.describe('Combined Filter Tests - Critical for Web Search Triggering', () => {
    test('should trigger web search for CBS + Talk Show + Guild (0 local results)', async ({ page }) => {
      // This is the key test case that should trigger web search
      await page.click('button:has-text("Talk Show")');
      await page.click('button:has-text("CBS")');
      await page.click('button:has-text("Guild")');
      await page.click('button:has-text("Search")');
      
      // This should trigger web search since we know there are 0 local results
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 90000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      // CRITICAL: Should never return 0 results due to web search fallback
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should handle Amazon Prime + Sci-Fi combination', async ({ page }) => {
      await page.click('button:has-text("Sci-Fi")');
      await page.click('button:has-text("Amazon Prime")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      // Should have results (we know this has local results)
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should handle FOX + Variety combination', async ({ page }) => {
      await page.click('button:has-text("Variety")');
      await page.click('button:has-text("FOX")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should handle TNT + Animation combination', async ({ page }) => {
      await page.click('button:has-text("Animation")');
      await page.click('button:has-text("TNT")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should handle multiple networks with single genre', async ({ page }) => {
      await page.click('button:has-text("Thriller")');
      await page.click('button:has-text("TNT")');
      await page.click('button:has-text("FX")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });
  });

  test.describe('Union Status Filter Tests', () => {
    test('should filter by Guild union status', async ({ page }) => {
      await page.click('button:has-text("Guild")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should filter by Non-Union status', async ({ page }) => {
      await page.click('button:has-text("Non-Union")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 60000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });
  });

  test.describe('Experience Range Filter Tests', () => {
    test('should filter by experience range', async ({ page }) => {
      // Test with minimum experience filter
      await page.fill('input[data-testid="min-experience"]', '5');
      await page.fill('input[data-testid="max-experience"]', '15');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });
  });

  test.describe('Award Winners Filter Tests', () => {
    test('should filter for award winners only', async ({ page }) => {
      await page.click('input[data-testid="award-winners-checkbox"]');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });
  });

  test.describe('Complex Multi-Filter Combinations', () => {
    test('should handle complex filter combination that likely triggers web search', async ({ page }) => {
      // Combination likely to have 0 local results
      await page.click('button:has-text("Musical")');
      await page.click('button:has-text("VH1")');
      await page.click('button:has-text("Non-Union")');
      await page.click('button:has-text("Search")');
      
      // Should trigger web search
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 90000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      // CRITICAL: Should never return 0 results due to web search fallback
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should handle another rare combination', async ({ page }) => {
      await page.click('button:has-text("Horror")');
      await page.click('button:has-text("History")');
      await page.click('button:has-text("Guild")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 90000 });
      
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });
  });

  test.describe('Filter State Management', () => {
    test('should maintain filter selections', async ({ page }) => {
      // Select multiple filters
      await page.click('button:has-text("Drama")');
      await page.click('button:has-text("Netflix")');
      await page.click('button:has-text("Guild")');
      
      // Verify filters are selected
      await expect(page.locator('button:has-text("Drama").bg-blue-500')).toBeVisible();
      await expect(page.locator('button:has-text("Netflix").bg-blue-500')).toBeVisible();
      await expect(page.locator('button:has-text("Guild").bg-blue-500')).toBeVisible();
    });

    test('should allow filter deselection', async ({ page }) => {
      // Select and then deselect a filter
      await page.click('button:has-text("Comedy")');
      await expect(page.locator('button:has-text("Comedy").bg-blue-500')).toBeVisible();
      
      await page.click('button:has-text("Comedy")');
      await expect(page.locator('button:has-text("Comedy").bg-blue-500')).not.toBeVisible();
    });
  });

  test.describe('Zero Results Web Search Fallback - CRITICAL TESTS', () => {
    test('should never return 0 results for any filter combination', async ({ page }) => {
      // Test multiple rare combinations that should trigger web search
      const rareCombinations = [
        ['Talk Show', 'MTV'],
        ['Musical', 'Discovery'],
        ['Documentary', 'CW'],
        ['Game Show', 'TNT']
      ];

      for (const [genre, network] of rareCombinations) {
        // Reset page
        await page.goto('/');
        
        // Apply filters
        await page.click(`button:has-text("${genre}")`);
        await page.click(`button:has-text("${network}")`);
        await page.click('button:has-text("Search")');
        
        // Wait for results (including potential web search)
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 90000 });
        
        // CRITICAL: Should never be 0 due to web search fallback
        const resultsText = await page.locator('[data-testid="results-count"]').textContent();
        expect(resultsText).not.toContain('0 editors found');
      }
    });
  });
}); 