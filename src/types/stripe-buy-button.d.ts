// Lets TypeScript accept the custom element used by Stripe Buy Button
declare namespace JSX {
  interface IntrinsicElements {
    'stripe-buy-button': any;
  }
}
