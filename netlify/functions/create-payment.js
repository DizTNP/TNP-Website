const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Netlify Function: Create Stripe Payment Session
 * 
 * This function creates a Stripe Checkout session for the service call fee payment.
 * After successful payment, it calls the add-customer function to add the customer to QuickBooks.
 * 
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY: Your Stripe secret key
 * - STRIPE_PUBLISHABLE_KEY: Your Stripe publishable key (for frontend)
 * - NETLIFY_URL: Your Netlify site URL (for webhook URLs)
 * 
 * Setup Instructions:
 * 1. Add STRIPE_SECRET_KEY to Netlify environment variables
 * 2. Add STRIPE_PUBLISHABLE_KEY to Netlify environment variables  
 * 3. Add NETLIFY_URL to Netlify environment variables
 * 4. Test with Stripe test keys first, then switch to live keys
 */

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse the request body
        const body = JSON.parse(event.body);
        
        // Validate required fields
        const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'serviceAddress', 'serviceType', 'serviceDescription', 'appointmentDate', 'appointmentTime'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: `Missing required field: ${field}` })
                };
            }
        }

        // Get the service call fee amount (configurable, default $50)
        const serviceCallFee = parseInt(process.env.SERVICE_CALL_FEE) || 5000; // Amount in cents
        
        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Service Call Fee - Top Notch Plumbing',
                            description: `Service call fee for ${body.serviceType} appointment on ${body.appointmentDate} at ${body.appointmentTime}`,
                            images: ['https://tnpplumbing.com/images/tnp-logo.jpg'], // Optional: Add your logo
                        },
                        unit_amount: serviceCallFee, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NETLIFY_URL || 'https://tnpplumbing.com'}/scheduling.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NETLIFY_URL || 'https://tnpplumbing.com'}/scheduling.html?canceled=true`,
            customer_email: body.customerEmail,
            metadata: {
                customerName: body.customerName,
                customerEmail: body.customerEmail,
                customerPhone: body.customerPhone,
                serviceAddress: body.serviceAddress,
                serviceType: body.serviceType,
                serviceDescription: body.serviceDescription,
                appointmentDate: body.appointmentDate,
                appointmentTime: body.appointmentTime,
                isEmergency: body.isEmergency || 'false',
                specialInstructions: body.specialInstructions || '',
                source: 'website_scheduling_form'
            },
            billing_address_collection: 'required',
            phone_number_collection: {
                enabled: true,
            },
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                sessionId: session.id,
                url: session.url
            })
        };

    } catch (error) {
        console.error('Stripe Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to create payment session',
                details: error.message 
            })
        };
    }
};
