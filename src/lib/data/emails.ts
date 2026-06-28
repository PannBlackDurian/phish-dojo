// =============================================================================
//  Training dataset.  A deliberately varied set: classic phish, business-email
//  compromise, lookalike domains — plus legitimate mail that *looks* alarming,
//  so the trainee learns judgement, not just paranoia.
//
//  Span tokens with a `ref` are inspectable in the UI. A ref pointing at a
//  `cues[]` id is a real red flag; one pointing at a `decoys[]` id is a benign
//  element (flagging it is a false alarm).
// =============================================================================

import type { TrainingEmail } from '$lib/types';

export const emails: TrainingEmail[] = [
	// ---- 1. Classic credential phish ----------------------------------------
	{
		id: 'helpdesk',
		from: { name: 'IT Service Desk', email: 'support@m1crosoft-help.co', ref: 'hd-domain' },
		to: 'you@acme-corp.com',
		subject: 'ACTION REQUIRED: Your password expires in 2 hours',
		subjectRef: 'hd-urgency',
		date: 'Today, 08:14',
		isPhishing: true,
		body: [
			['Dear User,'],
			[
				'Our records indicate that your email password will ',
				{ ref: 'hd-urgency', text: 'expire within 2 hours' },
				'. To avoid losing access to your mailbox, you must verify your account immediately using the secure portal below.'
			],
			['Failure to re-validate will result in permanent account suspension.'],
			['Regards,', 'The IT Service Desk Team']
		],
		links: [
			{
				label: 'Verify my account now',
				display: 'https://acme-corp.com/login',
				href: 'http://acme-corp.secure-verify.ru/login',
				ref: 'hd-link'
			}
		],
		cues: [
			{
				id: 'hd-domain',
				label: 'Lookalike sender domain',
				explanation:
					'“m1crosoft-help.co” uses a digit-for-letter swap (1 for i) and a .co TLD. Real Microsoft mail comes from microsoft.com.',
				severity: 'high'
			},
			{
				id: 'hd-urgency',
				label: 'Manufactured urgency',
				explanation:
					'A hard 2-hour deadline and threats of suspension are designed to make you act before you think.',
				severity: 'medium'
			},
			{
				id: 'hd-link',
				label: 'Mismatched link target',
				explanation:
					'The link reads “acme-corp.com/login” but actually points to secure-verify.ru — a foreign domain harvesting credentials.',
				severity: 'high'
			}
		],
		decoys: [],
		takeaway:
			'IT will never ask you to “re-validate” a password through an emailed link under a countdown.',
		difficulty: 1
	},

	// ---- 2. Legitimate — looks scary, is fine -------------------------------
	{
		id: 'github-alert',
		from: { name: 'GitHub', email: 'noreply@github.com', ref: 'gh-noreply' },
		to: 'you@acme-corp.com',
		subject: 'A new SSH key was added to your account',
		date: 'Yesterday, 19:42',
		isPhishing: false,
		body: [
			['Hi sreyoun,'],
			[
				'A new SSH key was added to your GitHub account. If you recently added this key, you can ',
				{ ref: 'gh-ignore', text: 'safely ignore this email' },
				'.'
			],
			['If you did not add this key, review your account security using the button below.'],
			['Thanks,', 'The GitHub Team']
		],
		links: [
			{
				label: 'Review security settings',
				display: 'https://github.com/settings/keys',
				href: 'https://github.com/settings/keys',
				ref: 'gh-link'
			}
		],
		cues: [],
		decoys: [
			{
				id: 'gh-noreply',
				note: 'A no-reply@github.com sender is normal for automated notifications — the domain is genuine.'
			},
			{
				id: 'gh-ignore',
				note: '“Safely ignore” is standard wording for confirmation notices, not a manipulation tactic here.'
			},
			{
				id: 'gh-link',
				note: 'The displayed URL and the real destination both point to github.com/settings/keys. They match.'
			}
		],
		takeaway:
			'Genuine security notices come from the real domain and the link target matches what is shown. Not every alarming email is an attack.',
		difficulty: 1
	},

	// ---- 3. Business email compromise (gift cards) --------------------------
	{
		id: 'ceo-giftcards',
		from: { name: 'David Chen (CEO)', email: 'david.chen.ceo@gmail.com', ref: 'bec-domain' },
		to: 'you@acme-corp.com',
		subject: 'Quick favor — are you at your desk?',
		date: 'Today, 10:05',
		isPhishing: true,
		body: [
			['Hi,'],
			[
				"I'm heading into back-to-back meetings and need your help with something ",
				{ ref: 'bec-urgency', text: 'time-sensitive' },
				'. Are you available?'
			],
			[
				'I need you to purchase five $100 gift cards for a client appreciation gift. ',
				{ ref: 'bec-ask', text: 'Scratch off the codes and email them to me' },
				" — I'll approve the reimbursement right away."
			],
			['Please keep this between us until the announcement. Sent from my iPhone.']
		],
		cues: [
			{
				id: 'bec-domain',
				label: 'Executive on a personal address',
				explanation:
					'The “CEO” is writing from a generic gmail.com address, not the corporate domain. Display names are trivial to fake.',
				severity: 'high'
			},
			{
				id: 'bec-ask',
				label: 'Gift-card / code request',
				explanation:
					'Requests to buy gift cards and send the codes are the signature of business email compromise. Money sent this way is unrecoverable.',
				severity: 'high'
			},
			{
				id: 'bec-urgency',
				label: 'Urgency + secrecy',
				explanation:
					'Pressure to act fast and “keep this between us” is meant to stop you verifying through normal channels.',
				severity: 'medium'
			}
		],
		decoys: [],
		takeaway:
			'Any unusual payment or gift-card request “from the boss” should be confirmed by phone or in person — never trust the email alone.',
		difficulty: 2
	},

	// ---- 4. Parcel-delivery phish -------------------------------------------
	{
		id: 'parcel',
		from: { name: 'DHL Express', email: 'auto@dhl-parcel-track.com', ref: 'dhl-domain' },
		to: 'you@acme-corp.com',
		subject: 'Your parcel is on hold — customs fee of $1.99 unpaid',
		date: 'Today, 06:30',
		isPhishing: true,
		body: [
			['Dear customer,'],
			[
				'Your package #DHL-882190 could not be delivered because a small ',
				{ ref: 'dhl-fee', text: 'customs fee of $1.99' },
				' remains unpaid. Please settle the fee within 24 hours or your parcel will be returned to sender.'
			],
			['Reschedule your delivery and pay the outstanding fee here:']
		],
		links: [
			{
				label: 'Pay $1.99 & reschedule delivery',
				display: 'dhl.com/reschedule',
				href: 'https://dhl-parcel-track.com/pay?id=882190',
				ref: 'dhl-link'
			}
		],
		cues: [
			{
				id: 'dhl-domain',
				label: 'Imitation courier domain',
				explanation:
					'“dhl-parcel-track.com” is not a DHL domain. Couriers use their primary domain (dhl.com), not hyphenated variants.',
				severity: 'high'
			},
			{
				id: 'dhl-fee',
				label: 'Tiny payment to capture your card',
				explanation:
					'A trivial $1.99 fee lowers your guard while the real goal is to capture your card details on the payment page.',
				severity: 'medium'
			},
			{
				id: 'dhl-link',
				label: 'Link domain ≠ displayed domain',
				explanation:
					'It shows dhl.com but resolves to dhl-parcel-track.com. Always read the real destination, not the label.',
				severity: 'high'
			}
		],
		decoys: [],
		takeaway:
			'Were you actually expecting a parcel? Track it on the courier’s real website, never through a link demanding a fee.',
		difficulty: 2
	},

	// ---- 5. Legitimate — a reset you requested ------------------------------
	{
		id: 'slack-reset',
		from: { name: 'Slack', email: 'feedback@slack.com', ref: 'sl-sender' },
		to: 'you@acme-corp.com',
		subject: 'Finish setting up your password',
		date: 'Today, 09:58',
		isPhishing: false,
		body: [
			['Hi there,'],
			[
				'You recently asked to reset your Slack password for the ',
				{ ref: 'sl-workspace', text: 'acme-corp workspace' },
				'. Click below to choose a new one. This link expires in 60 minutes.'
			],
			["If you didn't request this, you can ignore this email and your password will stay the same."]
		],
		links: [
			{
				label: 'Confirm password reset',
				display: 'https://acme-corp.slack.com/reset',
				href: 'https://acme-corp.slack.com/reset',
				ref: 'sl-link'
			}
		],
		cues: [],
		decoys: [
			{
				id: 'sl-sender',
				note: 'feedback@slack.com is a legitimate Slack sending address, and the message matches a reset you initiated.'
			},
			{
				id: 'sl-workspace',
				note: 'It names your actual workspace (acme-corp) — generic phishing usually cannot.'
			},
			{
				id: 'sl-link',
				note: 'Displayed and real URL both point to your own acme-corp.slack.com subdomain. Consistent and expected.'
			}
		],
		takeaway:
			'A reset email you just triggered, from the real domain, with a matching link, is exactly what you should expect. Context matters.',
		difficulty: 2
	},

	// ---- 6. Sophisticated document-share phish ------------------------------
	{
		id: 'sharepoint',
		from: { name: 'Maria Lopez', email: 'maria.lopez@acme-corp.cloud', ref: 'sp-domain' },
		to: 'you@acme-corp.com',
		subject: 'Q3 Budget Review — shared with you',
		date: 'Today, 11:20',
		isPhishing: true,
		body: [
			['Hi,'],
			[
				'I’ve shared the ',
				{ ref: 'sp-doc', text: 'Q3 Budget Review.xlsx' },
				' with you for sign-off ahead of Friday. You may need to ',
				{ ref: 'sp-signin', text: 'sign in with your work account' },
				' to view it.'
			],
			['Let me know if the numbers in tab 3 look right to you.'],
			['Thanks,', 'Maria']
		],
		links: [
			{
				label: 'Open in SharePoint',
				display: 'acme-corp.sharepoint.com',
				href: 'https://acme-corp-cloud.web.app/auth/o365',
				ref: 'sp-link'
			}
		],
		cues: [
			{
				id: 'sp-domain',
				label: 'Near-identical domain',
				explanation:
					'Your company is acme-corp.com. This sender is acme-corp.cloud — a different domain registered to look like a sibling of yours.',
				severity: 'high'
			},
			{
				id: 'sp-link',
				label: 'Credential-harvest landing page',
				explanation:
					'“Open in SharePoint” actually leads to acme-corp-cloud.web.app — a hosting service impersonating the Microsoft 365 login.',
				severity: 'high'
			},
			{
				id: 'sp-signin',
				label: 'Unprompted “sign in” to view',
				explanation:
					'A document you are already authenticated for should not force a fresh login. That extra sign-in is the trap.',
				severity: 'medium'
			}
		],
		decoys: [
			{
				id: 'sp-doc',
				note: 'A plausible filename alone is not a red flag — attackers and colleagues both use realistic names. The domain and link are what give it away.'
			}
		],
		takeaway:
			'Sophisticated phishing copies real workflows. Check the sender’s exact domain and where “sign in” actually sends you.',
		difficulty: 3
	},

	// ---- 7. Legitimate — looks like BEC, is real ----------------------------
	{
		id: 'vendor-invoice',
		from: { name: 'Northwind Supplies — Billing', email: 'billing@northwind-supplies.com', ref: 'inv-external' },
		to: 'you@acme-corp.com',
		subject: 'Invoice #INV-20418 for August — due Sep 15',
		date: 'Tue, 14:03',
		isPhishing: false,
		body: [
			['Hello,'],
			[
				'Please find attached ',
				{ ref: 'inv-attach', text: 'invoice INV-20418 (PDF)' },
				' for August services, due by September 15. Our bank details are unchanged from previous invoices.'
			],
			[
				'If you have any questions, reply to this email or call the number on file. ',
				{ ref: 'inv-pay', text: 'Payment can be made via the usual bank transfer.' }
			],
			['Best regards,', 'Accounts Receivable, Northwind Supplies']
		],
		cues: [],
		decoys: [
			{
				id: 'inv-external',
				note: 'An external vendor domain is expected here — you do business with Northwind. The address matches prior correspondence.'
			},
			{
				id: 'inv-attach',
				note: 'An attached PDF invoice is normal billing practice. Scan it, but the attachment alone is not an attack signal.'
			},
			{
				id: 'inv-pay',
				note: 'Crucially, it says bank details are UNCHANGED and points to the usual process — the opposite of an invoice-fraud lure.'
			}
		],
		takeaway:
			'Real invoice fraud changes the bank details and pressures you. This one keeps everything as usual — trust, but verify large payments out of band.',
		difficulty: 3
	},

	// ---- 8. MFA / real-time phishing ----------------------------------------
	{
		id: 'mfa',
		from: { name: 'Account Security', email: 'security@ac-me-corp.com', ref: 'mfa-domain' },
		to: 'you@acme-corp.com',
		subject: 'Did you just try to sign in from Lagos, Nigeria?',
		date: 'Today, 12:47',
		isPhishing: true,
		body: [
			[
				'We blocked a sign-in attempt to your account from ',
				{ ref: 'mfa-geo', text: 'Lagos, Nigeria' },
				'. If this wasn’t you, secure your account now by confirming your identity.'
			],
			[
				'Enter the 6-digit code we just sent to your phone on the secure page to ',
				{ ref: 'mfa-code', text: 'lock out the intruder' },
				'.'
			],
			['This alert will expire shortly for your protection.']
		],
		links: [
			{
				label: 'Secure my account',
				display: 'https://acme-corp.com/security',
				href: 'https://acme-corp-id.com/verify',
				ref: 'mfa-link'
			}
		],
		cues: [
			{
				id: 'mfa-domain',
				label: 'Hyphen-split lookalike',
				explanation:
					'“ac-me-corp.com” splits your real domain (acme-corp.com) with an extra hyphen. A glance reads it as legitimate.',
				severity: 'high'
			},
			{
				id: 'mfa-code',
				label: 'Asks for your one-time code',
				explanation:
					'No legitimate service asks you to type your MFA code into a page from an email. That code is exactly what the attacker needs to log in as you in real time.',
				severity: 'high'
			},
			{
				id: 'mfa-link',
				label: 'Fake verification host',
				explanation:
					'The “secure” link goes to acme-corp-id.com — a separate domain built to capture your login and code.',
				severity: 'high'
			},
			{
				id: 'mfa-geo',
				label: 'Fear hook',
				explanation:
					'A scary foreign-login location triggers panic so you rush to “fix” it. Real alerts let you review activity, not hand over a code.',
				severity: 'low'
			}
		],
		decoys: [],
		takeaway:
			'Never type a one-time passcode into a link from an email. Open the app yourself and check sign-in activity directly.',
		difficulty: 3
	}
];

/** Stable id list, used to build the deck. */
export const emailIds = emails.map((e) => e.id);
