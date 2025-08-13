# Stripe Payment Integration Setup Guide

This guide will help you set up the Stripe payment integration for the TNP Plumbing website scheduling system.

## Overview

The payment integration includes:
- Service call fee payment ($50.00, configurable)
- Stripe Checkout for secure payment processing
- Automatic customer addition to QuickBooks after successful payment
- Success/error handling with user-friendly modals

## Prerequisites

1. **Stripe Account**: Create a Stripe account at https://stripe.com
2. **Netlify Account**: Your website should be deployed on Netlify
3. **QuickBooks Integration**: Existing QuickBooks setup (already configured)

## Step 1: Stripe Account Setup

### 1.1 Create Stripe Account
1. Go to https://stripe.com and sign up for an account
2. Complete the account verification process
3. Navigate to the Stripe Dashboard

### 1.2 Get API Keys
1. In the Stripe Dashboard, go to **Developers > API keys**
2. Copy your **Publishable key** and **Secret key**
3. **Important**: Use test keys first for development, then switch to live keys for production

### 1.3 Create Webhook Endpoint
1. In the Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-site.netlify.app/.netlify/functions/payment-webhook`
4. Select the event: `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Webhook signing secret** (starts with `whsec_`)

## Step 2: Netlify Environment Variables

Add the following environment variables in your Netlify dashboard:

### 2.1 Go to Netlify Dashboard
1. Log into your Netlify account
2. Select your TNP website project
3. Go to **Site settings > Environment variables**

### 2.2 Add Environment Variables

#### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Service Configuration
```
SERVICE_CALL_FEE=5000 (amount in cents, default $50.00)
NETLIFY_URL=https://your-site.netlify.app
```

#### QuickBooks Configuration (already configured)
```
QB_CLIENT_ID=your_quickbooks_client_id
QB_CLIENT_SECRET=your_quickbooks_client_secret
QB_ACCESS_TOKEN=your_quickbooks_access_token
QB_REFRESH_TOKEN=your_quickbooks_refresh_token
QB_REALM_ID=your_quickbooks_realm_id
QB_ENVIRONMENT=sandbox (or production)
```

## Step 3: Install Dependencies

The Stripe dependency has been added to `package.json`. Install it:

```bash
npm install
```

## Step 4: Deploy to Netlify

1. Commit and push your changes to your Git repository
2. Netlify will automatically deploy the updated site
3. Verify the deployment is successful

## Step 5: Test the Integration

### 5.1 Test Mode
1. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits

### 5.2 Test Flow
1. Go to your scheduling page
2. Fill out the appointment form
3. Click "Continue to Payment"
4. Complete the Stripe Checkout process
5. Verify the success modal appears
6. Check that customer is added to QuickBooks

## Step 6: Production Setup

### 6.1 Switch to Live Keys
1. In Stripe Dashboard, switch to **Live mode**
2. Copy the live **Publishable key** and **Secret key**
3. Update the environment variables in Netlify
4. Update the webhook endpoint URL to use your production domain

### 6.2 Update Webhook URL
1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Update the endpoint URL to: `https://yourdomain.com/.netlify/functions/payment-webhook`
3. Copy the new webhook signing secret
4. Update the `STRIPE_WEBHOOK_SECRET` environment variable

## Configuration Options

### Service Call Fee
The service call fee is configurable via the `SERVICE_CALL_FEE` environment variable:
- Default: `5000` (cents) = $50.00
- Example: `7500` = $75.00
- Example: `2500` = $25.00

### Customization
You can customize the payment flow by modifying:
- `netlify/functions/create-payment.js` - Payment session creation
- `netlify/functions/payment-webhook.js` - Payment success handling
- `scheduling.js` - Frontend payment processing
- `styles.css` - Payment modal styling

## Troubleshooting

### Common Issues

1. **Payment session creation fails**
   - Check `STRIPE_SECRET_KEY` is correct
   - Verify all required form fields are filled
   - Check Netlify function logs

2. **Webhook not receiving events**
   - Verify webhook URL is correct
   - Check `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook endpoint is accessible

3. **Customer not added to QuickBooks**
   - Check QuickBooks environment variables
   - Verify QuickBooks API credentials
   - Check webhook function logs

4. **Payment success modal not showing**
   - Check URL parameters are correct
   - Verify modal HTML exists in scheduling.html
   - Check JavaScript console for errors

### Debugging
1. Check Netlify function logs in the Netlify dashboard
2. Use browser developer tools to check for JavaScript errors
3. Test with Stripe CLI for local webhook testing
4. Verify all environment variables are set correctly

## Security Considerations

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** (implemented in webhook handler)
3. **Use HTTPS** for all production endpoints
4. **Regularly rotate API keys** for security
5. **Monitor payment activity** in Stripe Dashboard

## Support

For issues with:
- **Stripe**: Contact Stripe Support
- **Netlify**: Check Netlify documentation
- **QuickBooks**: Refer to QuickBooks API documentation
- **Website**: Check browser console and Netlify function logs

## Files Modified

- `scheduling.html` - Added payment integration and modals
- `scheduling.js` - Updated to handle payment flow
- `styles.css` - Added payment modal and fee notice styles
- `package.json` - Added Stripe dependency
- `netlify/functions/create-payment.js` - New payment session creation
- `netlify/functions/payment-webhook.js` - New webhook handler

## Testing Checklist

- [ ] Form validation works correctly
- [ ] Payment session creation succeeds
- [ ] Stripe Checkout redirects properly
- [ ] Payment success modal displays
- [ ] Customer data is added to QuickBooks
- [ ] Error handling works for failed payments
- [ ] Mobile responsiveness is maintained
- [ ] All environment variables are set correctly
