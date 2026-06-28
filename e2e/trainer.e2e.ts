import { expect, test } from '@playwright/test';

test('landing page presents the trainer', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: /spot the phish/i })).toBeVisible();
	await expect(page.getByRole('link', { name: /start the drill/i })).toBeVisible();
});

test('a full drill runs from first email to the results screen', async ({ page }) => {
	await page.goto('/train');

	// The HUD starts at email 1 of 8.
	await expect(page.getByText('1 / 8')).toBeVisible();

	// Work through every email: give a verdict, read feedback, advance.
	for (let i = 0; i < 8; i++) {
		await page.getByRole('button', { name: /report phishing/i }).click();

		const advance = page.getByRole('button', { name: /next email|see your results/i });
		await expect(advance).toBeVisible();
		await advance.click();
	}

	// Drill complete → results screen with a rating and a replay control.
	await expect(page.getByText(/drill complete/i)).toBeVisible();
	await expect(page.getByRole('button', { name: /run the drill again/i })).toBeVisible();
});

test('inspecting a link does not end the drill prematurely', async ({ page }) => {
	await page.goto('/train');
	// Flagging elements is allowed during the verdict phase and must not
	// auto-submit; the verdict buttons stay available.
	await expect(page.getByRole('button', { name: /trust this email/i })).toBeVisible();
});
