# Module 3: Billing & Subscription

**Status:** Core | **Priority:** Critical | **Phase:** 2 (Weeks 5-8)

## Quick Links
- [Authentication Module](./M1_AUTHENTICATION.md)
- [Analytics Module](./M4_ANALYTICS.md)
- [Compliance Module](./M8_COMPLIANCE.md)

---

## 3.1 Subscription Plans

### Endpoints
```
GET    /plans                  - List plans
POST   /plans                  - Create plan
GET    /plans/:id              - Get plan
PUT    /plans/:id              - Update plan
DELETE /plans/:id              - Delete plan
```

### Database
```sql
plans (id, organization_id, name, price, currency, billing_period, trial_days, stripe_product_id)
plan_features (id, plan_id, feature_name, feature_value)
plan_limits (id, plan_id, limit_name, limit_value)
```

### Plan Fields
- Name (required)
- Description
- Price (decimal)
- Currency (USD, EUR, etc.)
- Billing Period (monthly, annual)
- Trial Days (0-30)
- Features (list)
- Limits (usage limits)

### Default Plans
- **Free:** $0/month, limited features
- **Pro:** $99/month, most features
- **Enterprise:** Custom pricing, all features

---

## 3.2 Subscription Management

### Endpoints
```
GET    /subscriptions          - List subscriptions
POST   /subscriptions          - Create subscription
GET    /subscriptions/:id      - Get subscription
PUT    /subscriptions/:id      - Update subscription
DELETE /subscriptions/:id      - Cancel subscription
POST   /subscriptions/:id/change-plan - Change plan
```

### Database
```sql
subscriptions (id, organization_id, plan_id, status, current_period_start, current_period_end, stripe_subscription_id)
subscription_items (id, subscription_id, plan_id, quantity)
```

### Subscription Status
- active - Currently active
- paused - Temporarily paused
- cancelled - Cancelled
- expired - Trial expired
- past_due - Payment failed

---

## 3.3 Payment Processing

### Endpoints
```
GET    /payment-methods        - List payment methods
POST   /payment-methods        - Add payment method
PUT    /payment-methods/:id    - Update payment method
DELETE /payment-methods/:id    - Delete payment method
POST   /payment-methods/:id/default - Set as default
```

### Database
```sql
payment_methods (id, organization_id, type, stripe_payment_method_id, card_last_four, card_brand, card_exp_month, card_exp_year)
payments (id, organization_id, subscription_id, amount, currency, status, stripe_payment_intent_id)
```

### Payment Types
- card - Credit/debit card
- bank_account - Bank transfer (future)

### Payment Status
- pending - Processing
- succeeded - Completed
- failed - Failed
- refunded - Refunded

---

## 3.4 Invoice Management

### Endpoints
```
GET    /invoices               - List invoices
GET    /invoices/:id           - Get invoice
POST   /invoices/:id/download  - Download PDF
POST   /invoices/:id/resend    - Resend email
```

### Database
```sql
invoices (id, organization_id, subscription_id, invoice_number, status, amount_due, amount_paid, issue_date, due_date, pdf_url)
invoice_items (id, invoice_id, description, quantity, unit_price, amount)
```

### Invoice Status
- draft - Not sent
- sent - Sent to customer
- paid - Payment received
- overdue - Past due date
- cancelled - Cancelled

---

## 3.5 Usage-Based Billing

### Endpoints
```
GET    /usage                  - Get usage
POST   /usage/track            - Track usage
```

### Database
```sql
usage_records (id, organization_id, metric_name, value, period_start, period_end)
```

### Tracked Metrics
- API calls
- Storage (GB)
- Users
- Custom metrics

---

## 3.6 Credits & Refunds

### Endpoints
```
GET    /credits                - Get credits
POST   /refunds                - Create refund
GET    /refunds                - List refunds
```

### Database
```sql
credits (id, organization_id, amount, reason, expires_at)
refunds (id, organization_id, payment_id, amount, reason, status)
```

---

## Stripe Integration

### Configuration
```
API Key: sk_live_...
Webhook Secret: whsec_...
Endpoints:
  - charge.succeeded
  - charge.failed
  - customer.subscription.updated
  - customer.subscription.deleted
```

### Webhook Handling
- Payment succeeded → Update subscription
- Payment failed → Send notification
- Subscription updated → Update local record
- Subscription deleted → Mark as cancelled

---

## Frontend Components

### Pages
- `/billing/plans` - Plan selection
- `/billing/subscription` - Subscription management
- `/billing/payment-methods` - Payment method management
- `/billing/invoices` - Invoice history
- `/billing/usage` - Usage tracking
- `/billing/credits` - Credit management

### Components
- `PlanCard` - Plan display
- `PlanComparison` - Plan comparison table
- `PaymentForm` - Payment method form
- `InvoiceList` - Invoices list
- `UsageChart` - Usage visualization

---

## Error Codes

| Code | Status | Message |
|------|--------|---------|
| PLAN_NOT_FOUND | 404 | Plan not found |
| INVALID_PLAN | 400 | Invalid plan |
| PAYMENT_FAILED | 402 | Payment failed |
| SUBSCRIPTION_ACTIVE | 400 | Subscription already active |
| INVALID_CARD | 400 | Invalid card |
| INSUFFICIENT_CREDITS | 402 | Insufficient credits |

---

## Testing Strategy

### Unit Tests
- Plan validation
- Price calculation
- Subscription status transitions
- Credit calculation

### Integration Tests
- Complete subscription flow
- Payment processing
- Invoice generation
- Refund processing

### E2E Tests
- User subscription to payment
- Plan upgrade/downgrade
- Invoice download
- Refund request

---

## Related Documentation
- [Analytics Module](./M4_ANALYTICS.md)
- [Compliance Module](./M8_COMPLIANCE.md)
- [Architecture Overview](../ARCHITECTURE.md)
