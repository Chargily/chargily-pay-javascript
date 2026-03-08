# Chargily Pay JavaScript SDK - Security & Code Audit Report

**Author:** [@ramdaniAli](https://github.com/ramdaniAli)
**Date:** 2026-03-08
**SDK Version:** 2.1.0
**Scope:** Full codebase review (src/*, package.json, tsconfig.json)

---

## Executive Summary

This audit covers the entire `@chargily/chargily-pay` SDK codebase. The SDK is a functional HTTP wrapper around the Chargily Pay V2 API, but it contains **5 critical bugs**, **8 high-severity issues**, and lacks essential infrastructure for a production payment library.

The SDK has **no tests, no CI/CD, no linting, no retry/timeout logic, no caching, and no typed error handling** — all of which are expected in a payment gateway SDK.

---

## Critical Bugs (5)

### CRITICAL-1: `updateProduct`, `updatePrice`, `updatePaymentLink` use POST instead of PATCH

**Files:** `src/classes/client.ts` lines 192, 263, 386

`updateCustomer` correctly uses `PATCH`, but the three other update methods use `POST`. This will either create duplicate resources or return 405 errors from the API.

```ts
// client.ts:192 — BUG
return this.request(`products/${product_id}`, 'POST', update_data);
// Should be: 'PATCH'

// client.ts:263 — BUG
return this.request(`prices/${price_id}`, 'POST', update_data);
// Should be: 'PATCH'

// client.ts:386-390 — BUG
return this.request(`payment-links/${payment_link_id}`, 'POST', update_data);
// Should be: 'PATCH'
```

**Fix:** Replace `'POST'` with `'PATCH'` in all three methods.

---

### CRITICAL-2: `verifySignature` throws instead of returning `false`

**File:** `src/utils/index.ts` lines 14-37

The function signature says `returns boolean`, and the early guard (line 16) correctly returns `false`. But when the signature is actually invalid (the main failure case), it **throws an Error** instead of returning `false`.

```ts
// Line 16 — correct behavior
if (!signature) return false;

// Lines 29-34 — inconsistent behavior
if (signatureBuffer.length !== digest.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
  throw new Error('The signature is invalid.'); // BUG: should return false
}
```

This forces developers into a confusing try/catch + boolean pattern for a single function.

**Fix:** Replace the `throw` with `return false`.

---

### CRITICAL-3: `console.log` in production library code

**File:** `src/utils/index.ts` line 36

```ts
console.log('The signature is valid'); // Pollutes every consumer's stdout
return true;
```

Library code must never log to the console. This will print on every valid webhook in every app using this SDK.

**Fix:** Remove the `console.log` statement.

---

### CRITICAL-4: `success_url` validation logic is broken

**File:** `src/classes/client.ts` lines 294-299

```ts
if (
  !checkout_data.success_url.startsWith('http') &&
  !checkout_data.success_url.startsWith('https')
)
```

Since `'https://...'` always starts with `'http'`, the second condition is **dead code**. This also means `'httpanything'` or `'http-malicious'` pass validation. Additionally, `failure_url` and `webhook_endpoint` are never validated.

**Fix:** Use `new URL()` constructor for validation, and validate all URL fields.

---

### CRITICAL-5: API error response body is never parsed

**File:** `src/classes/client.ts` lines 88-100

When the API returns 4xx/5xx, the error body (which contains the actual error message, validation details, etc.) is discarded:

```ts
if (!response.ok) {
  // The JSON body with {message, errors} is never read
  throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
}
```

Developers cannot programmatically know *why* an API call failed — they only get "status 422: Unprocessable Entity" with no details.

**Fix:** Parse the error body and throw a typed `ChargilyApiError` with `status`, `statusText`, and `body`.

---

## High Severity Issues (8)

### HIGH-1: `sigPrefix` is an empty placeholder

**File:** `src/utils/index.ts` line 19

```ts
const sigPrefix = ''; // Define if there's a specific prefix used
```

This is a TODO comment left as production code. If Chargily's API uses a prefix like `sha256=` (as GitHub webhooks do), all signature verifications will silently fail.

---

### HIGH-2: No pagination beyond page 1

**File:** `src/classes/client.ts` — all `list*()` methods

All list methods accept `per_page` but have **no `page` parameter**. Developers cannot access data beyond the first page. The `ListResponse` type correctly models `current_page`, `last_page`, `next_page_url` — but the SDK provides no way to use them.

```ts
// Every list method looks like this:
public async listCustomers(per_page: number = 10): Promise<ListResponse<Customer>> {
  const endpoint = `customers?per_page=${per_page}`;
  // No page parameter — stuck on page 1 forever
}
```

---

### HIGH-3: `getCheckoutItems` and `getPaymentLinkItems` return wrong types

**File:** `src/classes/client.ts` lines 344-354, 424-434

These methods return `ListResponse<CheckoutItemParams>` and `ListResponse<PaymentLinkItemParams>` (input types), but the API returns `CheckoutItem` and `PaymentLinkItem` (response types with `id`, `amount`, `currency`, etc.). TypeScript will lie to developers about the shape of the data.

---

### HIGH-4: `CreateCustomerParams` allows empty objects

**File:** `src/types/param.ts` lines 3-18

All fields are optional (`?`). The Chargily API requires at least `name`, but `createCustomer({})` compiles fine and fails at runtime.

---

### HIGH-5: No `per_page` validation

**File:** `src/classes/client.ts` — all `list*()` methods

`per_page: 0`, `per_page: -1`, or `per_page: 999999` are sent to the API without any bounds checking.

---

### HIGH-6: `UpdatePriceParams.metadata` is required instead of optional

**File:** `src/types/param.ts` lines 79-82

```ts
export interface UpdatePriceParams {
  metadata: Record<string, any>; // Missing '?' — forces metadata even if you don't want to update it
}
```

---

### HIGH-7: Type mismatch on `shipping_address`

**File:** `src/types/param.ts` line 127 vs `src/types/data.ts` line 222

Input type says `shipping_address?: string` but the response type says `shipping_address: Address` (an object with `country`, `state`, `address`). These are incompatible.

---

### HIGH-8: Non-nullable fields that should be nullable

**File:** `src/types/data.ts`

Several `Checkout` fields are typed as non-nullable but are optional at creation:
- `description: string` → should be `string | null`
- `failure_url: string` → should be `string | null`
- `webhook_endpoint: string` → should be `string | null`
- `shipping_address: Address` → should be `Address | null`

Code like `checkout.description.toLowerCase()` will crash at runtime when the API returns `null`.

---

## Missing Features — Proposals

### 1. Typed Error Hierarchy

```ts
class ChargilyError extends Error { }
class ChargilyApiError extends ChargilyError {
  constructor(
    public status: number,
    public statusText: string,
    public body: { message: string; errors?: Record<string, string[]> } | null
  ) { }
}
class ChargilyValidationError extends ChargilyError { }
class ChargilyNetworkError extends ChargilyError { }
```

This lets developers distinguish network failures from API validation errors from authentication issues.

### 2. Retry with Exponential Backoff + Timeout

```ts
interface ChargilyClientOptions {
  api_key: string;
  mode: 'test' | 'live';
  timeout?: number;        // default: 30000ms
  maxRetries?: number;     // default: 3
  retryDelay?: number;     // default: 1000ms (base for exponential backoff)
}
```

The `request()` method should:
- Use `AbortController` for request timeout
- Retry on 429 (rate limit) with `Retry-After` header support
- Retry on 503 (service unavailable) with exponential backoff
- Never retry on 4xx (client errors are permanent)

### 3. Idempotency Key Support

```ts
public async createCheckout(
  checkout_data: CreateCheckoutParams,
  options?: { idempotencyKey?: string }
): Promise<Checkout>
```

Essential for payment operations to prevent duplicate charges on network retries.

### 4. Webhook Event Types

```ts
type WebhookEventType = 'checkout.paid' | 'checkout.failed' | 'checkout.expired' | 'checkout.canceled';

interface WebhookEvent<T = any> {
  id: string;
  type: WebhookEventType;
  data: T;
  created_at: number;
}

interface CheckoutPaidEvent extends WebhookEvent<Checkout> {
  type: 'checkout.paid';
}

// Discriminated union for type-safe event handling
type ChargilyWebhookEvent = CheckoutPaidEvent | CheckoutFailedEvent | ...;
```

### 5. Full Pagination Support

```ts
// Option A: Add page parameter
public async listCustomers(options?: { per_page?: number; page?: number }): Promise<ListResponse<Customer>>

// Option B: Auto-paginating async generator
public async *listAllCustomers(per_page: number = 10): AsyncGenerator<Customer>
```

### 6. API Status / Health Check

```ts
public async getApiStatus(): Promise<{ status: 'operational' | 'degraded' | 'down'; mode: 'test' | 'live'; latency_ms: number }>
```

With mode mismatch detection:
```ts
// Warn developers when API key mode doesn't match configured mode
const balance = await client.getBalance();
if (balance.livemode !== (this.mode === 'live')) {
  console.warn('[chargily] Mode mismatch: configured as ${this.mode} but API key is ${balance.livemode ? "live" : "test"}');
}
```

### 7. Payment Link Customization

If the API supports it, expose options like:
```ts
interface CreatePaymentLinkParams {
  // ... existing fields
  theme?: { primary_color?: string; logo_url?: string; };
  custom_fields?: Array<{ label: string; type: 'text' | 'email' | 'phone'; required?: boolean }>;
}
```

### 8. Caching Layer (Optional Redis Support)

```ts
interface ChargilyClientOptions {
  // ... existing fields
  cache?: {
    adapter: 'memory' | 'redis';
    ttl?: number; // seconds
    redisUrl?: string;
  };
}
```

Cache `getProduct`, `getPrice`, `getCustomer` responses to reduce API calls under high load.

---

## Missing Infrastructure

| Category | Status | Recommendation |
|----------|--------|---------------|
| **Testing** | None | Add Vitest with unit tests for all 25 methods + webhook utils |
| **CI/CD** | None | GitHub Actions: build, test, lint on every PR |
| **Linting** | None | ESLint + Prettier with pre-commit hooks (Husky + lint-staged) |
| **Type checking** | Partial | Update `@types/node` from `^14` to `^18`, add `engines: { node: ">=18" }` |
| **Changelog** | None | Add CHANGELOG.md, consider conventional commits |
| **Contributing guide** | None | Add CONTRIBUTING.md with setup instructions |
| **Documentation** | README only | Add TypeDoc for auto-generated API docs |
| **tsconfig** | Outdated | Target `es2017`+ instead of `es5` (SDK uses `fetch` which is Node 18+) |
| **Security** | No policy | Add SECURITY.md with vulnerability reporting process |

---

## How to Reproduce

```bash
git clone https://github.com/chargily/chargily-pay-javascript.git
# Open src/classes/client.ts lines 192, 263, 386 — POST instead of PATCH
# Open src/utils/index.ts lines 29-36 — throw + console.log
# Open src/classes/client.ts lines 294-299 — broken URL validation
# Open src/classes/client.ts lines 88-100 — error body discarded
```

---

## Next Steps

I (@ramdaniAli) am willing to contribute fixes for all the issues listed above. I propose to work in the following order:

1. **PR #1 — Bug fixes:** Fix all 5 critical bugs + 8 high-severity issues
2. **PR #2 — Error handling:** Add typed error hierarchy + parse API error bodies
3. **PR #3 — Resilience:** Add retry, timeout, idempotency key support
4. **PR #4 — Pagination:** Add `page` parameter + `listAll*()` async generators
5. **PR #5 — Webhook DX:** Add typed webhook events + remove console.log
6. **PR #6 — Infrastructure:** Add Vitest, ESLint, Prettier, GitHub Actions CI

I'd appreciate maintainer feedback on priorities and any API constraints before starting implementation.

---

*This audit was conducted as a community contribution to improve the SDK's reliability and developer experience.*
