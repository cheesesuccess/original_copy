import { onMount } from "solid-js";

export default function SuccessPage() {
  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const companyRef = params.get("CompanyRef");

    if (companyRef) {
      const res = await fetch("/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyRef })
      });

      const data = await res.json();
      console.log("Verification Result:", data);

      if (data && data.Status === "SUCCESS") {
        alert("Payment Successful!");
      } else {
        alert("Payment Failed or Pending");
      }
    }
  });

  return (
    <div class="p-4 text-center">
      <h1 class="text-2xl font-bold mb-2">Payment Result</h1>
      <p>Processing your payment status... Please wait.</p>
    </div>
  );
}
