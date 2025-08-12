const QuickBooks = require('node-quickbooks');

/**
 * Netlify Function: Add Customer to QuickBooks Online
 * 
 * This function is triggered when a new customer submits the signup form.
 * It automatically creates a customer record in QuickBooks Online.
 * 
 * Environment Variables Required:
 * - QB_CLIENT_ID: QuickBooks OAuth Client ID
 * - QB_CLIENT_SECRET: QuickBooks OAuth Client Secret
 * - QB_ACCESS_TOKEN: QuickBooks Access Token
 * - QB_REFRESH_TOKEN: QuickBooks Refresh Token
 * - QB_REALM_ID: QuickBooks Company/Realm ID
 * - QB_ENVIRONMENT: 'sandbox' or 'production'
 * 
 * Testing: Use 'sandbox' environment for testing, 'production' for live data
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
        // Parse the form data from Netlify Forms
        const body = JSON.parse(event.body);
        
        // Validate required fields
        const requiredFields = ['name', 'phone', 'address-line1', 'city', 'state', 'zip', 'email'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: `Missing required field: ${field}` })
                };
            }
        }

        // Initialize QuickBooks connection
        const qbo = new QuickBooks(
            process.env.QB_CLIENT_ID,
            process.env.QB_CLIENT_SECRET,
            process.env.QB_ACCESS_TOKEN,
            process.env.QB_REFRESH_TOKEN,
            process.env.QB_REALM_ID,
            process.env.QB_ENVIRONMENT === 'sandbox', // true for sandbox, false for production
            false // debug mode off
        );

        // Check if access token needs refresh
        try {
            await new Promise((resolve, reject) => {
                qbo.refreshAccessToken((err, accessToken, refreshToken) => {
                    if (err) {
                        console.error('Error refreshing access token:', err);
                        reject(err);
                    } else {
                        console.log('Access token refreshed successfully');
                        resolve();
                    }
                });
            });
        } catch (refreshError) {
            console.error('Failed to refresh access token:', refreshError);
            // Continue with existing token if refresh fails
        }

        // Prepare customer data for QuickBooks
        const customerData = {
            DisplayName: body.name,
            PrimaryPhone: {
                FreeFormNumber: body.phone
            },
            PrimaryEmailAddr: {
                Address: body.email
            },
            BillAddr: {
                Line1: body['address-line1'],
                City: body.city,
                CountrySubDivisionCode: body.state,
                PostalCode: body.zip,
                Country: 'USA'
            },
            Notes: `Customer signed up via website on ${new Date().toISOString()}`,
            Active: true
        };

        // Create customer in QuickBooks
        return new Promise((resolve, reject) => {
            qbo.createCustomer(customerData, (err, customer) => {
                if (err) {
                    console.error('QuickBooks API Error:', err);
                    resolve({
                        statusCode: 500,
                        body: JSON.stringify({ 
                            error: 'Failed to create customer in QuickBooks',
                            details: err.message 
                        })
                    });
                } else {
                    console.log('Customer created successfully in QuickBooks:', customer.Id);
                    resolve({
                        statusCode: 200,
                        body: JSON.stringify({ 
                            success: true,
                            message: 'Customer added to QuickBooks successfully',
                            customerId: customer.Id,
                            customerName: customer.DisplayName
                        })
                    });
                }
            });
        });

    } catch (error) {
        console.error('Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
};
