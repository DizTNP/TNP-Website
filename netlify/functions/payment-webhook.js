const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const QuickBooks = require('node-quickbooks');

/**
 * Netlify Function: Stripe Payment Webhook Handler
 * 
 * This function handles Stripe webhook events, specifically payment success.
 * When a payment is successful, it automatically adds the customer to QuickBooks.
 * 
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY: Your Stripe secret key
 * - STRIPE_WEBHOOK_SECRET: Your Stripe webhook endpoint secret
 * - QB_CLIENT_ID: QuickBooks OAuth Client ID
 * - QB_CLIENT_SECRET: QuickBooks OAuth Client Secret
 * - QB_ACCESS_TOKEN: QuickBooks Access Token
 * - QB_REFRESH_TOKEN: QuickBooks Refresh Token
 * - QB_REALM_ID: QuickBooks Company/Realm ID
 * - QB_ENVIRONMENT: 'sandbox' or 'production'
 * 
 * Setup Instructions:
 * 1. Create a webhook endpoint in your Stripe dashboard
 * 2. Set the webhook URL to: https://your-site.netlify.app/.netlify/functions/payment-webhook
 * 3. Select the 'checkout.session.completed' event
 * 4. Copy the webhook secret and add it as STRIPE_WEBHOOK_SECRET
 */

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const sig = event.headers['stripe-signature'];
    let stripeEvent;

    try {
        // Verify the webhook signature
        stripeEvent = stripe.webhooks.constructEvent(
            event.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Webhook signature verification failed' })
        };
    }

    try {
        // Handle the event
        switch (stripeEvent.type) {
            case 'checkout.session.completed':
                await handlePaymentSuccess(stripeEvent.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${stripeEvent.type}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ received: true })
        };

    } catch (error) {
        console.error('Webhook handler error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Webhook handler failed' })
        };
    }
};

// Handle successful payment
async function handlePaymentSuccess(session) {
    console.log('Payment successful for session:', session.id);
    
    try {
        // Extract customer data from session metadata
        const metadata = session.metadata;
        
        // Parse address components
        const addressParts = metadata.serviceAddress.split(',').map(part => part.trim());
        const addressLine1 = addressParts[0] || '';
        const city = addressParts[1] || 'Paducah';
        const state = addressParts[2] || 'KY';
        const zip = addressParts[3] || '';
        
        // Prepare customer data for QuickBooks
        const customerData = {
            name: metadata.customerName,
            phone: metadata.customerPhone,
            email: metadata.customerEmail,
            'address-line1': addressLine1,
            city: city,
            state: state,
            zip: zip
        };

        // Add customer to QuickBooks
        await addCustomerToQuickBooks(customerData);
        
        // TODO: Send confirmation email to customer
        // TODO: Send notification to TNP team
        
        console.log('Customer successfully added to QuickBooks after payment');
        
    } catch (error) {
        console.error('Error processing payment success:', error);
        // Don't throw error to avoid webhook retry loops
        // Log error for manual review
    }
}

// Add customer to QuickBooks
async function addCustomerToQuickBooks(customerData) {
    return new Promise((resolve, reject) => {
        // Initialize QuickBooks connection
        const qbo = new QuickBooks(
            process.env.QB_CLIENT_ID,
            process.env.QB_CLIENT_SECRET,
            process.env.QB_ACCESS_TOKEN,
            process.env.QB_REFRESH_TOKEN,
            process.env.QB_REALM_ID,
            process.env.QB_ENVIRONMENT === 'sandbox',
            false
        );

        // Check if access token needs refresh
        qbo.refreshAccessToken((err, accessToken, refreshToken) => {
            if (err) {
                console.error('Error refreshing access token:', err);
                // Continue with existing token if refresh fails
            } else {
                console.log('Access token refreshed successfully');
            }
        });

        // Prepare customer data for QuickBooks
        const qbCustomerData = {
            DisplayName: customerData.name,
            PrimaryPhone: {
                FreeFormNumber: customerData.phone
            },
            PrimaryEmailAddr: {
                Address: customerData.email
            },
            BillAddr: {
                Line1: customerData['address-line1'],
                City: customerData.city,
                CountrySubDivisionCode: customerData.state,
                PostalCode: customerData.zip,
                Country: 'USA'
            },
            Notes: `Customer created via website payment on ${new Date().toISOString()}`,
            Active: true
        };

        // Create customer in QuickBooks
        qbo.createCustomer(qbCustomerData, (err, customer) => {
            if (err) {
                console.error('QuickBooks API Error:', err);
                reject(err);
            } else {
                console.log('Customer created successfully in QuickBooks:', customer.Id);
                resolve(customer);
            }
        });
    });
}
