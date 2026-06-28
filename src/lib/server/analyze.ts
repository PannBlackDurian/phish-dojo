// =============================================================================
//  Email analyzer — the "real-world" engine behind the paste-and-analyze tool.
//  Given raw email text (headers + body, or just a pasted message), it surfaces
//  explainable phishing indicators the way a real mail-security check would:
//  sender-domain spoofing, link/domain tricks, urgency & payment-fraud language.
//
//  Pure and dependency-free, so it is trivially testable and runs server-side.
// =============================================================================

export type Severity = 'high' | 'medium' | 'low' | 'info';

export interface Finding {
	severity: Severity;
	title: string;
	detail: string;
	evidence?: string;
}

export interface LinkFinding {
	url: string;
	host: string;
	suspicious: boolean;
	reasons: string[];
}

export interface AnalysisResult {
	riskScore: number; // 0–100
	verdict: 'high-risk' | 'suspicious' | 'likely-safe';
	sender: { raw: string; address: string; domain: string } | null;
	findings: Finding[];
	links: LinkFinding[];
	stats: { urls: number; flaggedUrls: number };
}

const WEIGHT: Record<Severity, number> = { high: 32, medium: 15, low: 6, info: 0 };

const FREEMAIL = new Set([
	'gmail.com',
	'googlemail.com',
	'yahoo.com',
	'ymail.com',
	'outlook.com',
	'hotmail.com',
	'live.com',
	'aol.com',
	'icloud.com',
	'gmx.com',
	'proton.me',
	'protonmail.com',
	'mail.com'
]);

const SUSPICIOUS_TLDS = new Set([
	'ru',
	'cn',
	'tk',
	'ml',
	'ga',
	'cf',
	'gq',
	'xyz',
	'top',
	'work',
	'click',
	'link',
	'zip',
	'mov',
	'country',
	'review',
	'su',
	'rest',
	'fit'
]);

const SHORTENERS = new Set([
	'bit.ly',
	'tinyurl.com',
	't.co',
	'goo.gl',
	'ow.ly',
	'is.gd',
	'buff.ly',
	'rebrand.ly',
	'cutt.ly',
	'shorturl.at',
	'rb.gy',
	'tiny.cc'
]);

const BRANDS = [
	'microsoft',
	'office365',
	'sharepoint',
	'outlook',
	'apple',
	'icloud',
	'google',
	'amazon',
	'aws',
	'paypal',
	'stripe',
	'netflix',
	'facebook',
	'meta',
	'instagram',
	'whatsapp',
	'linkedin',
	'dhl',
	'fedex',
	'ups',
	'usps',
	'dropbox',
	'docusign',
	'adobe',
	'coinbase',
	'binance'
];

const ROLE_WORDS = [
	'ceo',
	'cfo',
	'support',
	'helpdesk',
	'admin',
	'administrator',
	'it team',
	'it dept',
	'security',
	'account',
	'billing',
	'finance',
	'hr',
	'payroll',
	'service desk'
];

const URGENCY = [
	'urgent',
	'immediately',
	'as soon as possible',
	'right away',
	'within 24 hours',
	'within 2 hours',
	'expire',
	'expires',
	'suspended',
	'suspend',
	'deactivat',
	'final notice',
	'act now',
	'failure to',
	'limited time',
	'last warning'
];

const CREDENTIAL = [
	'verify your account',
	'confirm your account',
	'confirm your identity',
	'update your password',
	'reset your password',
	'log in to',
	'sign in to verify',
	'validate your',
	're-validate',
	'unlock your account'
];

const PAYMENT = [
	'gift card',
	'gift cards',
	'wire transfer',
	'bank transfer',
	'bank details',
	'account number',
	'routing number',
	'invoice attached',
	'change of bank',
	'updated bank',
	'cryptocurrency',
	'bitcoin'
];

const OTP = ['one-time code', 'one time code', 'otp', 'verification code', '6-digit code', 'mfa code', 'security code'];

function hostOf(raw: string): string {
	try {
		const u = new URL(raw.match(/^https?:\/\//i) ? raw : 'http://' + raw);
		return u.hostname.toLowerCase();
	} catch {
		return '';
	}
}

function tldOf(host: string): string {
	const p = host.split('.');
	return p[p.length - 1] ?? '';
}

function registrableOf(host: string): string {
	const p = host.split('.');
	return p.slice(-2).join('.');
}

function sldOf(host: string): string {
	const p = host.split('.');
	return (p.length >= 2 ? p[p.length - 2] : p[0]) ?? '';
}

/** Extract sender from a `From:` header, else the first address in the text. */
function findSender(text: string): AnalysisResult['sender'] {
	const fromLine = text.match(/^\s*from\s*:\s*(.+)$/im)?.[1]?.trim();
	const scope = fromLine ?? text;
	const addr = scope.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/)?.[0];
	if (!addr) return null;
	return { raw: fromLine ?? addr, address: addr.toLowerCase(), domain: addr.split('@')[1].toLowerCase() };
}

function extractUrls(text: string): string[] {
	const out = new Set<string>();
	const re = /\b(?:https?:\/\/|www\.)[^\s<>"')\]]+/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(text))) out.add(m[0].replace(/[.,);]+$/, ''));
	return [...out];
}

function brandInHost(host: string): string | null {
	for (const b of BRANDS) if (host.includes(b)) return b;
	return null;
}

function analyzeSender(sender: NonNullable<AnalysisResult['sender']>, findings: Finding[]) {
	const { domain, raw } = sender;
	const sld = sldOf(domain);
	const tld = tldOf(domain);

	if (FREEMAIL.has(domain)) {
		const lc = raw.toLowerCase();
		if (ROLE_WORDS.some((r) => lc.includes(r))) {
			findings.push({
				severity: 'high',
				title: 'Company role sent from a personal mailbox',
				detail:
					'The sender presents as an official role (e.g. CEO, IT, billing) but uses a free personal email. This is the classic shape of business-email-compromise fraud.',
				evidence: raw
			});
		} else {
			findings.push({
				severity: 'low',
				title: 'Free email provider',
				detail: 'Sent from a personal free-mail domain. Fine for individuals, unusual for official business mail.',
				evidence: domain
			});
		}
	}

	if (domain.startsWith('xn--') || domain.includes('.xn--')) {
		findings.push({
			severity: 'high',
			title: 'Punycode in sender domain',
			detail: 'The domain uses punycode (xn--), often used to render letters that look identical to a trusted brand.',
			evidence: domain
		});
	}

	if (/[0-9]/.test(sld)) {
		findings.push({
			severity: 'medium',
			title: 'Digits inside the sender domain',
			detail:
				'Numbers swapped for letters are a common lookalike trick (e.g. m1crosoft for microsoft, paypa1 for paypal).',
			evidence: domain
		});
	}

	if (sld.includes('-') && BRANDS.some((b) => sld.includes(b))) {
		findings.push({
			severity: 'medium',
			title: 'Brand name with extra hyphen',
			detail: 'A trusted brand split or padded with hyphens (e.g. acme-corp-secure) is a frequent impersonation pattern.',
			evidence: domain
		});
	}

	if (SUSPICIOUS_TLDS.has(tld)) {
		findings.push({
			severity: 'medium',
			title: `Uncommon top-level domain ".${tld}"`,
			detail: 'This TLD is disproportionately used in abuse and rarely used by the brands it tends to imitate.',
			evidence: domain
		});
	}
}

function analyzeLink(url: string): LinkFinding {
	const host = hostOf(url);
	const reasons: string[] = [];
	const lc = url.toLowerCase();

	if (!host) return { url, host: '(unparseable)', suspicious: true, reasons: ['Malformed or obfuscated URL'] };

	if (/^https?:\/\/\d{1,3}(\.\d{1,3}){3}/i.test(url)) reasons.push('Links to a raw IP address instead of a domain name');
	if (host.startsWith('xn--') || host.includes('.xn--')) reasons.push('Punycode host — can imitate a real brand with lookalike characters');
	if (/:\/\/[^/]*@/.test(url)) reasons.push('Contains "@" before the host — hides the real destination after it');
	if (SHORTENERS.has(registrableOf(host))) reasons.push('URL shortener — conceals the true destination');
	if (SUSPICIOUS_TLDS.has(tldOf(host))) reasons.push(`Uncommon TLD ".${tldOf(host)}" associated with abuse`);
	if (lc.startsWith('http://')) reasons.push('Unencrypted http:// link');
	if (host.split('.').length >= 5) reasons.push('Unusually deep subdomain chain');

	const brand = brandInHost(host);
	if (brand && !sldOf(host).includes(brand) && registrableOf(host) !== `${brand}.com`) {
		reasons.push(`Mentions "${brand}" but the real domain is ${registrableOf(host)}`);
	}

	return { url, host, suspicious: reasons.length > 0, reasons };
}

function analyzeAnchorMismatch(text: string, findings: Finding[]) {
	const re = /<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(text))) {
		const realHost = hostOf(m[1]);
		const shownText = m[2].replace(/<[^>]+>/g, '').trim();
		const shownHost = hostOf(shownText);
		if (realHost && shownHost && registrableOf(realHost) !== registrableOf(shownHost)) {
			findings.push({
				severity: 'high',
				title: 'Link text disguises the real destination',
				detail: `The link shows "${shownHost}" but actually points to ${realHost}.`,
				evidence: m[1]
			});
		}
	}
}

function analyzeBody(text: string, findings: Finding[]) {
	const lc = text.toLowerCase();
	const hits = (list: string[]) => list.filter((k) => lc.includes(k));

	const u = hits(URGENCY);
	if (u.length)
		findings.push({
			severity: 'medium',
			title: 'Pressure / urgency language',
			detail: 'Time pressure and threats are engineered to make you act before you verify.',
			evidence: u.slice(0, 4).join(', ')
		});

	const c = hits(CREDENTIAL);
	if (c.length)
		findings.push({
			severity: 'high',
			title: 'Asks you to verify / re-enter credentials',
			detail: 'Legitimate services do not ask you to confirm a login through an emailed link.',
			evidence: c.slice(0, 3).join(', ')
		});

	const p = hits(PAYMENT);
	if (p.length)
		findings.push({
			severity: 'high',
			title: 'Money or payment-detail request',
			detail: 'Gift cards, wire transfers and "changed bank details" are hallmarks of payment fraud (BEC).',
			evidence: p.slice(0, 3).join(', ')
		});

	const o = hits(OTP);
	if (o.length)
		findings.push({
			severity: 'high',
			title: 'Requests a one-time / MFA code',
			detail: 'Never enter an MFA or one-time code into a page from an email — it lets an attacker log in as you in real time.',
			evidence: o.slice(0, 3).join(', ')
		});

	if (/\bdear\s+(customer|user|member|client|account holder)\b/i.test(text))
		findings.push({
			severity: 'low',
			title: 'Generic greeting',
			detail: 'A real provider that holds your account usually addresses you by name.'
		});

	const att = text.match(/[\w-]+\.(exe|scr|js|jar|zip|rar|html?|iso)\b/i);
	if (att && /attach/i.test(text))
		findings.push({
			severity: 'medium',
			title: 'Risky attachment type referenced',
			detail: 'Executable, archive or HTML attachments are common malware carriers.',
			evidence: att[0]
		});
}

export function analyzeEmail(text: string): AnalysisResult {
	const findings: Finding[] = [];
	const sender = findSender(text);

	if (sender) analyzeSender(sender, findings);
	analyzeAnchorMismatch(text, findings);
	analyzeBody(text, findings);

	const links = extractUrls(text).map(analyzeLink);
	for (const link of links) {
		for (const reason of link.reasons) {
			const severity: Severity = /ip address|punycode|@|disguise|real domain/i.test(reason)
				? 'high'
				: /shortener|uncommon tld/i.test(reason)
					? 'medium'
					: 'low';
			findings.push({ severity, title: 'Suspicious link', detail: reason, evidence: link.host });
		}
	}

	const raw = findings.reduce((sum, f) => sum + WEIGHT[f.severity], 0);
	const riskScore = Math.min(100, raw);
	const verdict = riskScore >= 55 ? 'high-risk' : riskScore >= 22 ? 'suspicious' : 'likely-safe';

	if (!findings.length)
		findings.push({
			severity: 'info',
			title: 'No common phishing indicators found',
			detail:
				'None of the automated checks fired. That is reassuring, but not proof of safety — if anything feels off, verify the sender through a channel you trust.'
		});

	return {
		riskScore,
		verdict,
		sender,
		findings,
		links,
		stats: { urls: links.length, flaggedUrls: links.filter((l) => l.suspicious).length }
	};
}
