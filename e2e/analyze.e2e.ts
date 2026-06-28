import { expect, test } from '@playwright/test';

test('analyzer flags a pasted phishing email', async ({ page }) => {
	await page.goto('/analyze');
	await expect(page.getByRole('heading', { name: /paste a suspicious email/i })).toBeVisible();

	await page.getByRole('button', { name: /load example/i }).click();
	await page.getByRole('button', { name: /analyze email/i }).click();

	// The example is a clear phish → expect a high-risk verdict and findings.
	await expect(page.getByText('High risk')).toBeVisible();
	await expect(page.getByText(/finding/i).first()).toBeVisible();
	// The lookalike sender domain should be among the findings.
	await expect(page.getByText(/digits inside the sender domain/i)).toBeVisible();
});
