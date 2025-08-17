# 🔒 Stripe Payment Integration Setup

## Current Status
✅ **Demo Version Implemented** - The website now includes a working Stripe demo that simulates payment processing.

## To Enable Real Payments:

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for a Stripe account
3. Complete business verification (required for live payments)

### 2. Get Your Stripe Keys
1. Login to Stripe Dashboard
2. Go to **Developers → API Keys**
3. Copy your **Publishable Key** (starts with `pk_test_` for test mode)
4. Copy your **Secret Key** (starts with `sk_test_` for test mode)

### 3. Update the Code
In `script.js`, replace this line:
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890abcdefghijklmnopqrstuvwxyzABCDEF'; // Demo key
```

With your actual key:
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_ACTUAL_STRIPE_PUBLISHABLE_KEY_HERE';
```

### 4. Server-Side Integration (Required for Production)
For real payments, you need a server to:
- Create checkout sessions securely
- Handle payment confirmations
- Send booking confirmations

**Option A: Simple Solution (Recommended)**
Use Stripe's hosted checkout:
```javascript
// Replace the demo function with:
function processPayment() {
    const lineItems = cart.map(item => ({
        price_data: {
            currency: 'eur',
            product_data: {
                name: item.service,
                description: `Durée: ${item.duration}`
            },
            unit_amount: parseInt(item.price) * 100
        },
        quantity: 1
    }));
    
    // This requires a server endpoint
    fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineItems })
    })
    .then(response => response.json())
    .then(data => {
        return stripe.redirectToCheckout({ sessionId: data.sessionId });
    });
}
```

**Option B: Full Custom Integration**
Build custom payment forms with Stripe Elements for a fully branded experience.

### 5. Server Setup Examples

**Node.js + Express:**
```javascript
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY');

app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: req.body.lineItems,
        mode: 'payment',
        success_url: 'https://yourdomain.com/success',
        cancel_url: 'https://yourdomain.com/cancel'
    });
    
    res.json({ sessionId: session.id });
});
```

**PHP:**
```php
require_once 'vendor/autoload.php';
\Stripe\Stripe::setApiKey('sk_test_YOUR_SECRET_KEY');

$session = \Stripe\Checkout\Session::create([
    'payment_method_types' => ['card'],
    'line_items' => $lineItems,
    'mode' => 'payment',
    'success_url' => 'https://yourdomain.com/success',
    'cancel_url' => 'https://yourdomain.com/cancel'
]);
```

### 6. Testing
1. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`
   - Requires 3D Secure: `4000 0025 0000 3155`

### 7. Go Live
1. Switch from test keys to live keys
2. Update webhook endpoints
3. Enable live mode in Stripe dashboard

## Cost Structure
- **EU Cards**: 1.4% + €0.25 per transaction
- **Non-EU Cards**: 2.9% + €0.25 per transaction
- **No setup fees or monthly fees**

## Security Features
✅ PCI DSS compliant  
✅ 3D Secure 2 support  
✅ Fraud detection  
✅ Strong Customer Authentication (SCA)  

## Support
- Stripe has excellent documentation: [stripe.com/docs](https://stripe.com/docs)
- 24/7 support available
- Large developer community

---

**Note**: The current implementation is a demonstration. For production use, implement proper server-side integration for security and compliance.