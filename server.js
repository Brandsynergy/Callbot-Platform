const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const OpenAI = require('openai');
const stripe = require('stripe');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize services
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client build
app.use(express.static('client/dist'));

// WhatsApp messaging function
async function sendWhatsAppMessage(phone, message) {
  try {
    const response = await axios.get('https://api.callmebot.com/whatsapp.php', {
      params: {
        phone: phone,
        text: message,
        apikey: process.env.CALLMEBOT_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return null;
  }
}

// AI Assistant function
async function getAIResponse(userMessage, context = '') {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful business assistant. ${context} Keep responses concise and friendly. If asked about orders or payments, guide them through the process.`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 150
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again.";
  }
}

// Twilio webhook for incoming calls
app.post('/webhook/voice', async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  
  try {
    // Log the call
    await supabase.from('calls').insert({
      caller_number: req.body.From,
      call_sid: req.body.CallSid,
      status: 'answered',
      duration: 0
    });

    // Welcome message
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Hello! Welcome to our business. I can help you with information about our products and services. Please speak after the beep.');

    // Gather speech input
    const gather = twiml.gather({
      input: 'speech',
      timeout: 5,
      action: '/webhook/process-speech'
    });

    gather.say('Please tell me how I can help you today.');

    // Fallback if no input
    twiml.say('I didn\'t hear anything. Please call back when you\'re ready to speak.');

  } catch (error) {
    console.error('Voice webhook error:', error);
    twiml.say('I\'m sorry, there was an error. Please try calling again.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// Process speech input
app.post('/webhook/process-speech', async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const speechResult = req.body.SpeechResult;

  try {
    // Get AI response
    const aiResponse = await getAIResponse(speechResult);
    
    // Update call log
    await supabase.from('calls').update({
      transcript: speechResult,
      ai_response: aiResponse
    }).eq('call_sid', req.body.CallSid);

    // Speak the AI response
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, aiResponse);

    // Ask if they need anything else
    const gather = twiml.gather({
      input: 'speech',
      timeout: 5,
      action: '/webhook/process-speech'
    });

    gather.say('Is there anything else I can help you with?');

    // End call if no response
    twiml.say('Thank you for calling. Have a great day!');
    twiml.hangup();

  } catch (error) {
    console.error('Speech processing error:', error);
    twiml.say('I\'m sorry, I had trouble understanding. Please try again.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// API Routes

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const { data: calls } = await supabase.from('calls').select('*');
    const { data: orders } = await supabase.from('orders').select('*');
    
    const totalCalls = calls?.length || 0;
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const avgCallDuration = calls?.reduce((sum, call) => sum + (call.duration || 0), 0) / totalCalls || 0;

    res.json({
      totalCalls,
      totalOrders,
      totalRevenue,
      avgCallDuration: Math.round(avgCallDuration)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get call logs
app.get('/api/calls', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders
app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add product
app.post('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(req.body)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create payment intent
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, currency = 'usd', orderId } = req.body;
    
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata: { orderId }
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process order and send WhatsApp confirmation
app.post('/api/process-order', async (req, res) => {
  try {
    const { customerPhone, items, total, paymentIntentId } = req.body;
    
    // Create order in database
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_phone: customerPhone,
        items: JSON.stringify(items),
        total,
        payment_intent_id: paymentIntentId,
        status: 'confirmed',
        confirmation_number: `ORD-${Date.now()}`
      })
      .select();
    
    if (error) throw error;
    
    // Send WhatsApp confirmation
    const confirmationMessage = `Order Confirmed! 
Confirmation #: ${order[0].confirmation_number}
Total: $${total}
Items: ${items.map(item => `${item.name} x${item.quantity}`).join(', ')}
Thank you for your order!`;
    
    await sendWhatsAppMessage(customerPhone, confirmationMessage);
    
    res.json({ success: true, order: order[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get FAQs
app.get('/api/faqs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add FAQ
app.post('/api/faqs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .insert(req.body)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update FAQ
app.put('/api/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('faqs')
      .update(req.body)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete FAQ
app.delete('/api/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`CallBot server running on port ${port}`);
});
