const { test, expect } = require('@playwright/test');
const APP_URL = process.env.APP_URL;
async function boot(page) {
  await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(600);
}
test('[P2P] app boots and renders content', async ({ page }) => {
  await boot(page);
  const has = await page.evaluate(() => !!document.body && document.body.children.length > 0);
  expect(has).toBe(true);
});
test('[P2P] no layout overflow (UI fits the viewport)', async ({ page }) => {
  await boot(page);
  const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(o).toBeLessThanOrEqual(2);
});

test('[F2P] Hovering over a building displays the tooltip', async ({ page }) => {
  await boot(page);

  const canvas = page.locator('#skyline');
  const tooltip = page.locator('#tooltip');

  await expect(canvas).toBeVisible();
  await expect(tooltip).toHaveClass(/hidden/);

  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();

  const points = [];

  for (let x = 20; x < box.width - 20; x += 20) {
    for (const yRatio of [0.65, 0.75, 0.85, 0.9]) {
      points.push({
        x,
        y: box.height * yRatio,
      });
    }
  }

  let tooltipVisible = false;

  for (const point of points) {
    await canvas.hover({ position: point });

    if (await tooltip.isVisible()) {
      tooltipVisible = true;
      break;
    }
  }

  expect(tooltipVisible).toBe(true);
  await expect(tooltip).not.toHaveClass(/hidden/);

  await expect(tooltip.locator('.tt-name')).toBeVisible();
  await expect(tooltip.locator('.tt-height')).toBeVisible();
  await expect(tooltip.locator('.tt-meta').first()).toBeVisible();
});

test('[F2P] Number shortcuts change the building count', async ({ page }) => {
  await boot(page);

  const countFilter = page.locator('#filter-count');

  await page.keyboard.press('1');
  await expect(countFilter).toHaveValue('3');

  await page.keyboard.press('2');
  await expect(countFilter).toHaveValue('5');

  await page.keyboard.press('3');
  await expect(countFilter).toHaveValue('10');

  await page.keyboard.press('6');
  await expect(countFilter).toHaveValue('25');

  await page.keyboard.press('0');
  await expect(countFilter).toHaveValue('30');
});

test('[F2P] Escape closes open modals', async ({ page }) => {
  await boot(page);

  const helpModal = page.locator('#modal-help');

  await page.keyboard.press('h');
  await expect(helpModal).not.toHaveClass(/hidden/);

  await page.keyboard.press('Escape');

  await expect(helpModal).toHaveClass(/hidden/);
});

test('[F2P] E shortcut triggers image export', async ({ page }) => {
  await boot(page);

  const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
  await page.keyboard.press('e');

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('tallest-buildings-rank.png');
});


test('[F2P] Searching for a building filters the results', async ({ page }) => {
  await boot(page);

  const search = page.locator('#filter-search');
  const buildingList = page.locator('#building-list');
  const listCount = page.locator('#list-count');

  await search.fill('Burj Khalifa');
  await page.waitForTimeout(300);

  await expect(buildingList).toContainText('Burj Khalifa');
  await expect(buildingList).not.toContainText('Shanghai Tower');
  await expect(listCount).toHaveText('1 building');
});

test('[F2P] Details stats display as four cards in two rows', async ({ page }) => {
  await boot(page);

  const firstCard = page.locator('.building-card').first();
  await expect(firstCard).toBeVisible({ timeout: 15000 });

  await firstCard.click();

  const stats = page.locator('.detail-stats');
  const cards = page.locator('.stat-box');

  await expect(stats).toBeVisible();
  await expect(cards).toHaveCount(4);

  const positions = await cards.evaluateAll((elements) =>
      elements.map((el) => {
        const rect = el.getBoundingClientRect();

        return {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
        };
      })
  );

  expect(Math.abs(positions[0].top - positions[1].top)).toBeLessThan(2);

  expect(Math.abs(positions[2].top - positions[3].top)).toBeLessThan(2);

  expect(positions[2].top).toBeGreaterThan(positions[0].bottom);
});

test('[F2P] Details stat cards fit within the panel', async ({ page }) => {
  await boot(page);

  const firstCard = page.locator('.building-card').first();
  await expect(firstCard).toBeVisible({ timeout: 15000 });

  await firstCard.click();

  const panel = page.locator('#detail-panel');
  const stats = page.locator('.detail-stats');
  const cards = page.locator('.stat-box');

  await expect(panel).toBeVisible();
  await expect(stats).toBeVisible();
  await expect(cards).toHaveCount(4);

  const panelBox = await panel.boundingBox();

  const cardBoxes = await cards.evaluateAll((elements) =>
      elements.map((el) => {
        const rect = el.getBoundingClientRect();

        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      })
  );

  expect(panelBox).toBeTruthy();

  const panelLeft = panelBox.x;
  const panelRight = panelBox.x + panelBox.width;

  for (const card of cardBoxes) {
    expect(card.left).toBeGreaterThanOrEqual(panelLeft);
    expect(card.right).toBeLessThanOrEqual(panelRight);
  }

  expect(Math.abs(cardBoxes[0].top - cardBoxes[1].top)).toBeLessThan(2);

  expect(Math.abs(cardBoxes[2].top - cardBoxes[3].top)).toBeLessThan(2);

  expect(cardBoxes[2].top).toBeGreaterThan(cardBoxes[0].bottom);
});

test('[F2P] S shortcut opens the Settings modal', async ({ page }) => {
  await boot(page);

  const settingsModal = page.locator('#modal-settings');

  await expect(settingsModal).toHaveClass(/hidden/);

  await page.keyboard.press('s');

  await expect(settingsModal).not.toHaveClass(/hidden/);
});

test('[F2P] R shortcut resets filters', async ({ page }) => {
  await boot(page);

  const regionFilter = page.locator('#filter-region');

  await regionFilter.selectOption({ index: 1 });
  await expect(regionFilter).not.toHaveValue('all');

  await page.keyboard.press('r');

  await expect(regionFilter).toHaveValue('all');
});

test('[F2P] T shortcut toggles the height stack', async ({ page }) => {
  await boot(page);

  const stack = page.locator('#height-stack');

  await expect(stack).toHaveClass(/hidden/);

  await page.keyboard.press('t');

  await expect(stack).not.toHaveClass(/hidden/);

  await page.keyboard.press('t');

  await expect(stack).toHaveClass(/hidden/);
});

test('[F2P] H shortcut opens the Help modal', async ({ page }) => {
  await boot(page);

  const modal = page.locator('#modal-help');

  await expect(modal).toHaveClass(/hidden/);

  await page.keyboard.press('h');

  await expect(modal).not.toHaveClass(/hidden/);
});
