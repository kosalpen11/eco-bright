# Agent Prompts

Reusable specialist prompts for ECO BRIGHT LED & SOLAR.

## Available Agents

### `invoice-share-qa-agent.md`
Use for invoice sharing, copy, PNG export, QR payload, and Telegram checkout testing.

### `layout-audit-agent.md`
Use for mobile, tablet, and desktop layout audits with emphasis on the storefront and invoice panel.

### `feature-best-practice-agent.md`
Use for code review of cart, invoice, share, and QR features with maintainability and App Router best practices in mind.

## Usage

Give the chosen file to a sub-agent or Codex continuation session and keep the task read-only unless you explicitly want fixes implemented.

Recommended order for release checks:

1. Run `invoice-share-qa-agent.md`
2. Run `layout-audit-agent.md`
3. Run `feature-best-practice-agent.md`
