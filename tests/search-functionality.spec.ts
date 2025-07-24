import { test, expect } from '@playwright/test';

test.describe('TV Editor Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TV Editor Finder/);
  });

  test.describe('Keyword Search Tests', () => {
    test('should search for TV series: Breaking Bad', async ({ page }) => {
      // Enter Breaking Bad search
      await page.fill('input[placeholder*="TV show"]', 'Breaking Bad');
      await page.click('button:has-text("Search")');
      
      // Wait for results
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find Breaking Bad editors
      await expect(page.locator('text=Kelley Dixon')).toBeVisible();
      await expect(page.locator('text=Lynne Willingham')).toBeVisible();
      await expect(page.locator('text=Skip Macdonald')).toBeVisible();
      
      // Verify results count > 0
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
    });

    test('should search for TV series: The Simpsons', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'The Simpsons');
      await page.click('button:has-text("Search")');
      
      // Wait for results (may trigger web search)
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 60000 });
      
      // Should have results (either local or web)
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should search for TV series: Game of Thrones', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Game of Thrones');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find Game of Thrones editors
      await expect(page.locator('text=Katie Weiland')).toBeVisible();
      await expect(page.locator('text=Tim Porter')).toBeVisible();
    });

    test('should search for TV series: Succession', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Succession');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find Succession editors
      await expect(page.locator('text=Jane Rizzo')).toBeVisible();
      await expect(page.locator('text=Ken Eluto')).toBeVisible();
    });

    test('should search for film: Mad Max Fury Road', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Mad Max Fury Road');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find Academy Award winner
      await expect(page.locator('text=Margaret Sixel')).toBeVisible();
    });
  });

  test.describe('Genre Search Tests', () => {
    test('should search for Drama genre', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Drama');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find drama specialists
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      
      // Should have multiple results (we know there are 57+)
      expect(resultsText).not.toContain('0 editors found');
      
      // Check for some known drama editors
      await expect(page.locator('text=John M. Valerio')).toBeVisible();
    });

    test('should search for Comedy genre', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Comedy');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find comedy specialists
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
      
      // Check for known comedy editors
      await expect(page.locator('text=Adam Epstein')).toBeVisible();
    });

    test('should search for Thriller genre', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Thriller');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find thriller specialists
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should search for Animation genre', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Animation');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find animation specialists
      await expect(page.locator('text=Chris McKay')).toBeVisible();
    });

    test('should search for Sci-Fi genre', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Sci-Fi');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find sci-fi specialists
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).toContain('editors found');
      expect(resultsText).not.toContain('0 editors found');
    });
  });

  test.describe('Award Winner Search Tests', () => {
    test('should search for Emmy winners', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Emmy');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find Emmy winners
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should search for Academy Award winners', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Academy Award');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      // Should find Academy Award winners or trigger web search
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });
  });

  test.describe('Network-Specific Search Tests', () => {
    test('should search for HBO editors', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'HBO');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      // Should find HBO editors or trigger web search
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should search for Netflix editors', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Netflix');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      // Should find Netflix editors or trigger web search
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });
  });

  test.describe('Unique Search Terms', () => {
    test('should search for editor names directly', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Margaret Sixel');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Should find the specific editor
      await expect(page.locator('text=Margaret Sixel')).toBeVisible();
    });

    test('should search for production terms', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'post-production');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      // Should find relevant editors or trigger web search
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });

    test('should search for editing techniques', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'film editing');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
      
      // Should find relevant editors or trigger web search
      const resultsText = await page.locator('[data-testid="results-count"]').textContent();
      expect(resultsText).not.toContain('0 editors found');
    });
  });

  test.describe('Auto-scroll Functionality', () => {
    test('should auto-scroll to results after search', async ({ page }) => {
      await page.fill('input[placeholder*="TV show"]', 'Breaking Bad');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Check that results section is in viewport
      const resultsSection = page.locator('[data-testid="search-results"]');
      await expect(resultsSection).toBeInViewport();
    });
  });
}); 