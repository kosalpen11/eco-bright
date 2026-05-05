# Sales Team Guide

This guide is written for sales staff, operators, and managers who need to work with incoming Telegram orders every day.

It is intentionally operational rather than code-heavy.

Related docs:

- `../menu-tree.md`
- `../message-copy.md`

## Telegram Roles In Daily Use

- customer ordering bot: `@eco_bright_bot`
- sales/support handoff target: `@eco_bright_sale_bot`
- admin bot: `@eco_bright_admin_bot`

Responsibility split:

- `@eco_bright_bot` helps the customer create the order
- `@eco_bright_sale_bot` handles human follow-up and support chat
- `@eco_bright_admin_bot` handles internal lifecycle control

Today, the sales team should treat `@eco_bright_sale_bot` as the communication channel and `@eco_bright_bot` as the conversion channel.

## What This Guide Covers

- how an order reaches the sales team
- what each Telegram action means
- when to accept, reject, clarify, process, complete, or cancel
- how to use notes and reasons correctly
- how to keep customer handling consistent

## Daily Workflow Overview

1. Customer places an order from the website or customer Telegram bot.
2. The order is saved in Neon first.
3. The order appears in the admin Telegram chat.
4. A sales operator reviews the message.
5. The operator takes the next action directly from Telegram.
6. The order status is updated in Neon and recorded in history.

## What Sales Sees in Telegram

Each incoming admin order message includes:

- order id
- invoice id
- source
- time created
- customer name if available
- customer phone if available
- customer note if available
- item list
- subtotal
- total
- current status

Buttons available:

- Accept
- Reject
- Clarify
- Processing
- Complete
- Cancel
- Custom Reason
- Add Note
- Refresh

## Meaning of Each Status

### Pending

The order was created by the customer and is waiting for staff review.

Use when:

- the order is new and untouched

### Accepted

The order looks valid and the team is ready to handle it.

Use when:

- product is available
- quantity looks fine
- no missing customer info blocks the next step

### Rejected

The order cannot be fulfilled.

Use when:

- item is unavailable
- order is invalid
- customer request cannot be processed

Always add a real reason. Avoid silent rejection.

### Needs Clarification

The order is possible, but staff need more information first.

Use when:

- quantity is unclear
- customer phone/name is missing for the next step
- delivery or configuration details are not clear
- customer note needs confirmation

### Processing

The team is actively preparing or handling the order.

Use when:

- stock is confirmed
- order is being prepared
- follow-up is in progress

### Completed

The order is finished from the team’s perspective.

Use when:

- order is fulfilled
- customer handoff is complete

### Cancelled

The order stopped after review or during processing.

Use when:

- customer cancelled
- staff cancelled after operational review
- order should not continue

## How To Use Each Action

### Accept

Use when the order is valid and ready to move forward.

What happens:

- status becomes `accepted`
- order history is written
- reviewer identity is stored

### Reject

Use for a direct rejection.

Current behavior:

- quick reject button sets a simple default reason
- use `Custom Reason` when the customer should receive a more specific explanation later

Recommended operator practice:

- avoid quick reject unless the reason is obvious and standard
- prefer `Custom Reason` for anything customer-facing

### Clarify

Use when the order is probably valid but needs more information.

What to write:

- a short actionable question
- one question at a time when possible

Good example:

- `Please confirm whether you need 2 units or 20 units.`

Bad example:

- `Need more info.`

### Processing

Use once the team is actively handling the order.

This tells other operators:

- the order is no longer just waiting in the queue
- work is already in progress

### Complete

Use only when the operational work is truly done.

### Cancel

Use when the order should stop permanently.

If the reason matters, add a note.

### Custom Reason

Use when rejecting or clarifying with operator-written text.

Flow:

1. tap `Custom Reason`
2. Telegram asks for the next message
3. send the reason text
4. the system saves it on the order

### Add Note

Use for internal staff notes.

Examples:

- `Customer asked for callback after 5 PM`
- `Stock confirmed by warehouse`
- `Waiting for final transport quote`

## Recommended Sales SOP

### For New Orders

1. read item list and total
2. check customer phone if required
3. verify stock or availability
4. choose one:
   - `Accept`
   - `Clarify`
   - `Reject`

### For Orders In Progress

1. move to `Processing` when work starts
2. add internal notes if needed
3. move to `Completed` when the order is done

### For Problem Orders

1. prefer `Clarify` before `Reject` if the issue is fixable
2. use `Custom Reason` when staff need to explain why
3. use `Cancel` when the order should stop completely

## Team Coordination Rules

Recommended team rules:

- do not change a status without reading the latest message first
- prefer `Add Note` for internal handoff context
- avoid vague reasons
- do not mark `Completed` too early
- use `Refresh` if there is any doubt the message is stale

## Example Operator Scenarios

### Scenario 1: Product is available

Action:

- `Accept`

Then:

- optionally `Processing`
- later `Completed`

### Scenario 2: Customer note is unclear

Action:

- `Clarify`

Reason example:

- `Please confirm whether you need warm white or cool white.`

### Scenario 3: Product is out of stock

Action:

- `Custom Reason`

Reason example:

- `This model is currently out of stock. We can suggest a similar option if you want.`

### Scenario 4: Internal follow-up needed

Action:

- `Add Note`

Note example:

- `Warehouse says replacement stock arrives tomorrow.`

## Escalation Guidance

Escalate to manager/support when:

- large or unusual order totals appear
- repeated clarification loops happen
- stock conflicts appear across multiple operators
- customer requests payment or delivery promises outside the normal workflow

## Current Limitations

Current system limits:

- customer Telegram auto-notification is not guaranteed yet
- some quick-order deeplink references still resolve a single product payload rather than a full multi-item cart
- admin and customer flow can share one bot, so clean operator discipline matters

## Quick Reference

Use this short rule set:

- `Accept` = valid and approved
- `Clarify` = need more information
- `Reject` = cannot fulfill
- `Processing` = work has started
- `Completed` = finished
- `Cancel` = stopped permanently
- `Add Note` = internal context
- `Refresh` = reload latest state before acting
