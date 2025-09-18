import { Show, createSignal, onMount } from 'solid-js';
import { Scaffold } from '~/components/scaffold/scaffold';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const BUY_BTN_SUBSCRIBE_ID   = import.meta.env.VITE_STRIPE_BUY_BUTTON_SUBSCRIBE_ID;
const BUY_BTN_DONATE_ID      = import.meta.env.VITE_STRIPE_BUY_BUTTON_DONATE_ID;
const PAYMENT_LINK_SUBSCRIBE = import.meta.env.VITE_STRIPE_SUBSCRIBE_LINK;
const PAYMENT_LINK_DONATE    = import.meta.env.VITE_STRIPE_DONATE_LINK;

export default function SettingsPage() {
  const [statusMsg, setStatusMsg] = createSignal<string>("");

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
    <Scaffold title="Settings">
      <div style={{
        display: 'grid',
        gap: '8px', // reduced vertical spacing
        'grid-template-columns': '1fr'
      }}>
        <h1 style={{ 'font-size': '22px', 'font-weight': 700, 'margin-bottom': '4px' }}>
          Support this project
        </h1>
        <p style={{ color: '#6b6b6b', 'margin-top': '-2px', 'margin-bottom': '6px' }}>
          Choose a monthly subscription or make a one-time donation. It keeps the music online ♥
        </p>

        <Show when={statusMsg()}>
          <div style={{
            padding: '10px 12px',
            background: '#eef8ee',
            color: '#145a32',
            'border-radius': '10px'
          }}>
            {statusMsg()}
          </div>
        </Show>

        {/* SUBSCRIBE CARD */}
        <section style={cardStyle()}>
          <h2 style={{ 'font-size': '18px', margin: 0 }}>Subscribe (weekly)</h2>
          <p style={{ color: '#5b5b5b', margin: 0 }}>
            Recommended for first time try-outs.
          </p>
          {renderSubscribeButton()}
        </section>

        {/* SUBSCRIBE CARD */}
        <section style={cardStyle()}>
          <h2 style={{ 'font-size': '18px', margin: 0 }}>Subscribe (monthly)</h2>
          <p style={{ color: '#5b5b5b', margin: 0 }}>
            Unlock HD streaming and help us grow.
          </p>
          {renderSubscribeButton()}
        </section>

        {/* DONATE CARD */}
        <section style={donateCardStyle()}>
          <h2 style={{ 'font-size': '18px', margin: 0 }}>Donate (one-time)</h2>
          <p style={{ color: '#5b5b5b', margin: 0 }}>
            A quick tip keeps the servers alive. Thank you!
          </p>
          {renderDonateButton()}
        </section>

        <Show when={!hasBuyButtons && !hasPaymentLinks}>
          <div style={{
            padding: '10px 12px',
            background: '#fff7e6',
            color: '#6b3e00',
            'border-radius': '10px',
            border: '1px solid #ffe2b3'
          }}>
            No Stripe info yet. Add env vars for Stripe Buy Button or Payment Links (see below).
          </div>
        </Show>
      </div>
    </Scaffold>
  );

  function renderSubscribeButton() {
    return (
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
    );
  }

  function renderDonateButton() {
    return (
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
    );
  }
}

function cardStyle(): any {
  return {
    background: '#fbf7ff',
    padding: '14px', // less padding
    'border-radius': '14px',
    border: '1px solid #efe6ff',
    display: 'grid',
    gap: '6px' // less vertical gap inside cards
  };
}

function donateCardStyle(): any {
  return {
    background: '#f7f6ff',
    padding: '14px',
    'border-radius': '14px',
    border: '1px solid #ecebff',
    display: 'grid',
    gap: '6px'
  };
}

function buttonStyle(): any {
  return {
    display: 'inline-block',
    padding: '10px 16px',
    'border-radius': '9999px',
    'font-weight': 700,
    'text-decoration': 'none',
    background: '#6d57c7',
    color: 'white',
    'text-align': 'center',
    'box-shadow': '0 4px 14px rgba(0,0,0,0.08)'
  };
}
