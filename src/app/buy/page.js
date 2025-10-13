"use client";

// import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";

// const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
// const customerKey = "_RUcEb7t-ZHGOPTXlmKNs";
import { CheckoutPage } from "@/components/Checkout";
// const generateRandomString = () => Math.random().toString(36).substring(2, 15);
export default function BuyPage() {
  return <CheckoutPage />;
}
