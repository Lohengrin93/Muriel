# 🔄 Stripe Refund Management for Cancellation Policy

## Current Cancellation Policy
- **48h+ advance notice**: 100% refund or free reschedule
- **<48h advance notice**: 20% cancellation fee, 80% refund or credit
- **No-show**: 100% forfeit

## Stripe Refund Implementation

### 1. Manual Processing (Recommended to Start)

**Advantages:**
- Simple to implement immediately
- Full control over each case
- No complex coding required
- Can handle edge cases easily

**Process:**
1. Customer emails/calls for cancellation
2. Check booking date vs cancellation date
3. Calculate appropriate refund:
   - 48h+: 100% refund via Stripe dashboard
   - <48h: 80% refund via Stripe dashboard
   - No-show: No refund

**Stripe Dashboard Steps:**
1. Go to Payments → Find payment
2. Click "Refund"
3. Enter amount: 
   - Full refund: Leave blank
   - Partial refund: Enter 80% of original amount
4. Add reason: "Cancellation policy - 80% refund"

### 2. Automated System (Future Enhancement)

**Backend Requirements:**
```javascript
// Example cancellation handler
app.post('/cancel-booking', async (req, res) => {
    const { paymentIntentId, bookingDate } = req.body;
    const cancellationDate = new Date();
    const booking = new Date(bookingDate);
    
    // Calculate hours between cancellation and booking
    const hoursNotice = (booking - cancellationDate) / (1000 * 60 * 60);
    
    let refundAmount;
    if (hoursNotice >= 48) {
        refundAmount = null; // Full refund
    } else if (hoursNotice > 0) {
        refundAmount = Math.floor(originalAmount * 0.8); // 80% refund
    } else {
        refundAmount = 0; // No refund for no-shows
    }
    
    if (refundAmount !== 0) {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: refundAmount,
            reason: 'requested_by_customer',
            metadata: {
                policy: hoursNotice >= 48 ? 'full_refund' : 'partial_refund',
                hours_notice: hoursNotice.toString()
            }
        });
    }
});
```

### 3. Credit System Alternative

Instead of immediate refunds for <48h cancellations:

**Advantages:**
- Encourages rebooking
- Reduces refund processing
- Better cash flow
- Customer retention

**Implementation:**
1. Create customer credit balance system
2. For <48h cancellations: Add 80% to credit balance
3. Apply credits to future bookings
4. Offer refund only if credit expires unused

### 4. Hybrid Approach (Best of Both Worlds)

**For <48h Cancellations, offer choice:**
- **Option A**: 80% refund to original payment method
- **Option B**: 100% credit for future sessions (bonus incentive)

## Current Website Updates Needed

### Update CGU Section:
```html
<h4>Remboursements Stripe</h4>
<p><strong>Paiement en ligne via Stripe :</strong></p>
<ul>
    <li>Annulation 48h+ : Remboursement automatique sous 5-10 jours ouvrables</li>
    <li>Annulation <48h : Remboursement de 80% sous 5-10 jours ouvrables</li>
    <li>Les frais de traitement Stripe (1,4% + 0,25€) sont déduits des remboursements partiels</li>
</ul>
```

### Update Contact Form:
Add cancellation request option with:
- Booking reference/date
- Reason for cancellation
- Preferred resolution (refund vs credit)

## Stripe Fees Consideration

**Important:** Stripe charges 1.4% + €0.25 per transaction
- Original payment: Customer pays fees
- Refund: You absorb the fees
- Partial refund: You lose fees on full amount

**Example:**
- Customer pays €50 (you receive ~€49.15 after Stripe fees)
- Late cancellation: 80% refund = €40 refund
- You lose: €10 (20% policy) + €0.85 (Stripe fees) = €10.85 total

**Recommendation:** Update policy to account for processing fees:
"Cancellation <48h: 20% fee + processing costs retained, remainder refunded"

## Next Steps

1. **Start with manual processing** using Stripe dashboard
2. **Track cancellation patterns** to see volume
3. **Implement automated system** if volume justifies development
4. **Consider credit system** to reduce refund processing

## Customer Communication Template

```
Bonjour [Nom],

Votre demande d'annulation pour la séance du [Date] a été traitée.

Selon notre politique d'annulation:
- Préavis: [X] heures
- Remboursement: [80%/100%] soit [Montant]€
- Délai: 5-10 jours ouvrables sur votre moyen de paiement original

[Si crédit applicable:]
Un crédit de [Montant]€ a été ajouté à votre compte, utilisable pendant 6 mois.

Cordialement,
Muriel Queyrel
```

---

**Current Status:** Manual processing recommended until automation is needed.