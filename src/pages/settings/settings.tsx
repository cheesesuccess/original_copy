import { Show, createSignal, onMount } from 'solid-js';
import { Scaffold } from '~/components/scaffold/scaffold'; //  Added for back button support

// ---------- ENV VARS ----------
// Use EITHER Buy Button IDs OR Payment Links.
// Buy Button (no backend needed):
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const BUY_BTN_SUBSCRIBE_ID   = import.meta.env.VITE_STRIPE_BUY_BUTTON_SUBSCRIBE_ID; // e.g. "buy_btn_1Qxxxxx..."
const BUY_BTN_DONATE_ID      = import.meta.env.VITE_STRIPE_BUY_BUTTON_DONATE_ID;    // e.g. "buy_btn_1Qyyyyy..."

// Payment Links (also no backend; just open a URL):
const PAYMENT_LINK_SUBSCRIBE = import.meta.env.VITE_STRIPE_SUBSCRIBE_LINK; // e.g. "https://buy.stripe.com/..."
const PAYMENT_LINK_DONATE    = import.meta.env.VITE_STRIPE_DONATE_LINK;    // e.g. "https://buy.stripe.com/..."


// ---------- SIMPLE PAGE ----------
export default function SettingsPage() {
  const [statusMsg, setStatusMsg] = createSignal<string>("");

  // Optional: show a thank-you if you send users back with ?success=1 or ?canceled=1
  onMount(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('success')) setStatusMsg("🎉 Thank you for your support!");
    if (q.get('canceled')) setStatusMsg("Payment canceled. You can try again anytime.");
  });

  const hasBuyButtons =
    Boolean(STRIPE_PUBLISHABLE_KEY && (BUY_BTN_SUBSCRIBE_ID || BUY_BTN_DONATE_ID));

  const hasPaymentLinks =
    Boolean(PAYMENT_LINK_SUBSCRIBE || PAYMENT_LINK_DONATE);

  return (
    <Scaffold title="Settings">  {/*  Back button appears automatically */}
      <div style={{
        padding: '20px',
        display: 'grid',
        gap: '16px',
        'grid-template-columns': '1fr',
        'max-width': '520px',
        margin: '4px 0'
      }}>
        <h1 style={{ 'font-size': '22px', 'font-weight': 700, 'margin-bottom': '8px' }}>
          Support this project
        </h1>
        <p style={{ color: '#6b6b6b', 'margin-top': '-6px' }}>
          Choose a monthly subscription or make a one-time donation. It keeps the music online ♥
        </p>

        <Show when={statusMsg()}>
          <div style={{
            padding: '12px 14px',
            background: '#eef8ee',
            color: '#145a32',
            'border-radius': '12px'
          }}>
            {statusMsg()}
          </div>
        </Show>

        {/* SUBSCRIBE CARD */}
        <section style={{
          background: '#fbf7ff',
          padding: '18px',
          'border-radius': '16px',
          border: '1px solid #efe6ff',
          display: 'grid',
          gap: '10px'
        }}>
          <h2 style={{ 'font-size': '18px', margin: 0 }}>Subscribe (weekly)</h2>
          <p style={{ color: '#5b5b5b', margin: 0 }}>
            Recommended for first time try-outs.
          </p>

          <Show
            when={hasBuyButtons && BUY_BTN_SUBSCRIBE_ID}
            fallback={
              <Show when={PAYMENT_LINK_SUBSCRIBE}>
                <a
                  href={PAYMENT_LINK_SUBSCRIBE!}
                  style={buttonStyle()}
                  rel="noopener noreferrer"
                >
                  SUBSCRIBE
                </a>
              </Show>
            }
          >
            <stripe-buy-button
              buy-button-id={BUY_BTN_SUBSCRIBE_ID!}
              publishable-key={STRIPE_PUBLISHABLE_KEY!}
            />
          </Show>
        </section>

        {/* SUBSCRIBE CARD */}
        <section style={{
          background: '#fbf7ff',
          padding: '18px',
          'border-radius': '16px',
          border: '1px solid #efe6ff',
          display: 'grid',
          gap: '10px'
        }}>
          <h2 style={{ 'font-size': '18px', margin: 0 }}>Subscribe (monthly)</h2>
          <p style={{ color: '#5b5b5b', margin: 0 }}>
            Unlock HD streaming and help us grow.
          </p>

          <Show
            when={hasBuyButtons && BUY_BTN_SUBSCRIBE_ID}
            fallback={
              <Show when={PAYMENT_LINK_SUBSCRIBE}>
                <a
                  href={PAYMENT_LINK_SUBSCRIBE!}
                  style={buttonStyle()}
                  rel="noopener noreferrer"
                >
                  SUBSCRIBE
                </a>
              </Show>
            }
          >
            <stripe-buy-button
              buy-button-id={BUY_BTN_SUBSCRIBE_ID!}
              publishable-key={STRIPE_PUBLISHABLE_KEY!}
            />
          </Show>
        </section>

        {/* DONATE CARD */}
        <section style={{
          background: '#f7f6ff',
          padding: '18px',
          'border-radius': '16px',
          border: '1px solid #ecebff',
          display: 'grid',
          gap: '10px'
        }}>
          <h2 style={{ 'font-size': '18px', margin: 0 }}>Donate (one-time)</h2>
          <p style={{ color: '#5b5b5b', margin: 0 }}>
            A quick tip keeps the servers alive. Thank you!
          </p>

          <Show
            when={hasBuyButtons && BUY_BTN_DONATE_ID}
            fallback={
              <Show when={PAYMENT_LINK_DONATE}>
                <a
                  href={PAYMENT_LINK_DONATE!}
                  style={buttonStyle()}
                  rel="noopener noreferrer"
                >
                  DONATE
                </a>
              </Show>
            }
          >
            <stripe-buy-button
              buy-button-id={BUY_BTN_DONATE_ID!}
              publishable-key={STRIPE_PUBLISHABLE_KEY!}
            />
          </Show>
        </section>

        {/* If nothing configured, show guidance */}
        <Show when={!hasBuyButtons && !hasPaymentLinks}>
          <div style={{
            padding: '12px 14px',
            background: '#fff7e6',
            color: '#6b3e00',
            'border-radius': '12px',
            border: '1px solid #ffe2b3'
          }}>
            No Stripe info yet. Add env vars for Stripe Buy Button or Payment Links (see below).
          </div>
        </Show>
      </div>
    </Scaffold>
  );
}

function buttonStyle(): any {
  return {
    display: 'inline-block',
    padding: '12px 18px',
    'border-radius': '9999px',
    'font-weight': 700,
    'text-decoration': 'none',
    background: '#6d57c7',
    color: 'white',
    'text-align': 'center',
    'box-shadow': '0 4px 14px rgba(0,0,0,0.08)'
  };
}
