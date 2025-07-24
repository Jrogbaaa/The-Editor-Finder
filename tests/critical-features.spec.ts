import { test, expect } from '@playwright/test';

test.describe('Critical TV Editor Search Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Essential Search Functionality', () => {
    test('should load homepage without errors', async ({ page }) => {
      // Check that the page loads and main elements are visible
      await expect(page.locator('text=Editor Finder')).toBeVisible();
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    });

    test('should search for Breaking Bad editors', async ({ page }) => {
      // Enter search term
      await page.fill('input[placeholder*="Search"]', 'Breaking Bad');
      await page.click('button:has-text("Search")');
      
      // Wait for results with extended timeout for web search
      await page.waitForSelector('text=editors found', { timeout: 60000 });
      
      // Should find results (either local or web)
      const resultText = await page.textContent('body');
      expect(resultText).not.toContain('0 editors found');
    });

    test('should search for Drama genre', async ({ page }) => {
      // First expand advanced filters to access genre buttons
      await page.click('button:has-text("Advanced Filters")');
      
      // Wait for advanced panel to appear
      await page.waitForSelector('text=Genres & Categories', { timeout: 10000 });
      
      // Click Drama genre filter
      await page.click('button:has-text("Drama")');
      await page.click('button:has-text("Search")');
      
      // Wait for results
      await page.waitForSelector('text=editors found', { timeout: 30000 });
      
      // Should find drama specialists
      const resultText = await page.textContent('body');
      expect(resultText).not.toContain('0 editors found');
    });
  });

  test.describe('Web Search Fallback - Critical Tests', () => {
    test('should never return 0 results for CBS Talk Show (web search trigger)', async ({ page }) => {
      // Expand advanced filters
      await page.click('button:has-text("Advanced Filters")');
      await page.waitForSelector('text=Genres & Categories', { timeout: 10000 });
      
      // Test the key combination that should trigger web search
      await page.click('button:has-text("Talk Show")');
      await page.click('button:has-text("CBS")');
      await page.click('button:has-text("Search")');
      
      // This should trigger web search, allow extended time
      await page.waitForSelector('text=editors found', { timeout: 120000 });
      
      // CRITICAL: Should never return 0 results due to web search fallback
      const resultText = await page.textContent('body');
      expect(resultText).not.toContain('0 editors found');
    });

    test('should handle Animation + Netflix search', async ({ page }) => {
      // Expand advanced filters
      await page.click('button:has-text("Advanced Filters")');
      await page.waitForSelector('text=Genres & Categories', { timeout: 10000 });
      
      await page.click('button:has-text("Animation")');
      await page.click('button:has-text("Netflix")');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('text=editors found', { timeout: 60000 });
      
      const resultText = await page.textContent('body');
      expect(resultText).not.toContain('0 editors found');
    });

    test('should handle rare combination that triggers web search', async ({ page }) => {
      // Expand advanced filters
      await page.click('button:has-text("Advanced Filters")');
      await page.waitForSelector('text=Genres & Categories', { timeout: 10000 });
      
      // Select a rare combination likely to have 0 local results
      await page.click('button:has-text("Musical")');
      await page.click('button:has-text("VH1")');
      await page.click('button:has-text("Search")');
      
      // Should trigger web search
      await page.waitForSelector('text=editors found', { timeout: 120000 });
      
      // CRITICAL: Should never return 0 results due to web search fallback
      const resultText = await page.textContent('body');
      expect(resultText).not.toContain('0 editors found');
    });
  });

  test.describe('TV Show Search Tests', () => {
    test('should find Game of Thrones editors', async ({ page }) => {
      await page.fill('input[placeholder*="Search"]', 'Game of Thrones');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('text=editors found', { timeout: 30000 });
      
      const resultText = await page.textContent('body');
      expect(resultText).not.toContain('0 editors found');
    });

    test('should find The Simpsons editors via web search', async ({ page }) => {
      await page.fill('input[placeholder*="Search"]', 'The Simpsons');
      await page.click('button:has-text("Search")');
      
      // This may trigger web search
      await page.waitForSelector('text=editors found', { timeout: 90000 });
      
      const resultText = await page.textContent('body');
      expect(resultText).not.toContain('0 editors found');
    });
  });

  test.describe('Award Winner Search', () => {
    test('should find Emmy winners', async ({ page }) => {
      await page.fill('input[placeholder*="Search"]', 'Emmy');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('text=editors found', { timeout: 30000 });
      
      const resultText = await page.textContent('body');
      expect(resultText).not.toContain('0 editors found');
    });

    test('should find Academy Award winners', async ({ page }) => {
      await page.fill('input[placeholder*="Search"]', 'Academy Award');
      await page.click('button:has-text("Search")');
      
      await page.waitForSelector('text=editors found', { timeout: 60000 });
      
      const resultText = await page.textContent('body');
      expect(resultText).not.toContain('0 editors found');
    });
  });

  test.describe('Core UI Functionality', () => {
    test('should allow filter selection and deselection', async ({ page }) => {
      // Expand advanced filters first
      await page.click('button:has-text("Advanced Filters")');
      await page.waitForSelector('text=Genres & Categories', { timeout: 10000 });
      
      // Select Drama filter
      await page.click('button:has-text("Drama")');
      
      // Check if it's selected (button should change appearance)
      const dramaButton = page.locator('button:has-text("Drama")');
      await expect(dramaButton).toHaveClass(/bg-primary|selected|active/);
      
      // Deselect
      await page.click('button:has-text("Drama")');
      
      // Should not be selected anymore
      await expect(dramaButton).not.toHaveClass(/bg-primary|selected|active/);
    });

    test('should navigate to admin panel', async ({ page }) => {
      await page.click('text=Admin');
      
      // Should navigate to admin page
      await expect(page).toHaveURL(/\/admin/);
    });
  });
}); 