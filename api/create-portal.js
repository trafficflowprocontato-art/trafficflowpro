const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // CORS headers - allow both www and non-www
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://trafficflowpro.com',
    'https://www.trafficflowpro.com',
    'http://localhost:8081'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId } = req.body || {};

    if (!customerId) {
      return res.status(400).json({ error: 'Missing customer ID' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    return res.status(200).json({ 
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to create portal session' 
    });
  }
};
