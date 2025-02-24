import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const razorpayWebhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function verifyRazorpaySignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the raw request body as text
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    console.log('Received Razorpay webhook:', payload);

    // Verify webhook signature
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      throw new Error('No signature found');
    }

    const isValidSignature = verifyRazorpaySignature(rawBody, signature, razorpayWebhookSecret);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      throw new Error('Invalid signature');
    }

    console.log('Webhook signature verified successfully');

    const { event, payload: eventPayload } = payload;
    const paymentId = eventPayload.payment?.entity?.id;
    const orderId = eventPayload.payment?.entity?.order_id;

    if (!paymentId || !orderId) {
      throw new Error('Invalid payload structure');
    }

    // Update payment record in database
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: event === 'payment.captured' ? 'completed' : 'failed',
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        payment_details: eventPayload,
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', orderId);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      throw updateError;
    }

    console.log('Payment record updated successfully');

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});