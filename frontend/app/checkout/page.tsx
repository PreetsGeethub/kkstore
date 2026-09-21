"use client";
import { addToGuestCart } from "@/lib/guestCartApi";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Smartphone, CreditCard, Landmark, Wallet, Loader2, Tag, X, Check, Plus } from "lucide-react";
import { useCart } from "@/components/Cart";
import { useAuth } from "@/components/Auth";
import { useToast } from "@/components/Toast";
import { loadRazorpayScript } from "@/lib/loadRazorpay";
import { initialAddress, type ShippingAddress } from "@/lib/checkoutTypes";
import { createAddress, addToServerCart, createOrder, createPayment, validateCoupon,verifyPayment} from "@/lib/checkoutApi";
import { getAddresses } from "@/lib/addressApi";
import type { Address } from "@/lib/addressTypes";

const paymentMethods = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "wallet", label: "Wallets", icon: Wallet },
] as const;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [address, setAddress] = useState<ShippingAddress>(initialAddress);
  const [selectedPayment, setSelectedPayment] = useState<string>("upi");
  const [placing, setPlacing] = useState(false);

  // Saved addresses (logged-in users only)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const shippingCost = subtotal >= 499 ? 0 : 49;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal + shippingCost - discount);

  // Load saved addresses for logged-in users
  useEffect(() => {
    if (!user) return;
    setLoadingAddresses(true);
    getAddresses()
      .then((addrs) => {
        setSavedAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.isDefault) ?? addrs[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddressForm(true);
        }
      })
      .catch(() => setShowNewAddressForm(true))
      .finally(() => setLoadingAddresses(false));
  }, [user]);

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const isNewAddressValid = () => {
    return (
      address.fullName.trim() &&
      address.phone.trim().length === 10 &&
      address.email.trim().includes("@") &&
      address.addressLine1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.pincode.trim().length === 6
    );
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!user) {
      showToast({
        variant: "error",
        title: "Log in to apply coupons",
        description: "Coupons are only available for logged-in accounts.",
      });
      return;
    }

    setApplyingCoupon(true);
    try {
      const result = await validateCoupon(couponCode.trim().toUpperCase(), subtotal);
      const discountAmount = result.discountAmount ?? result.discount ?? 0;

      setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount: discountAmount });
      showToast({
        variant: "success",
        title: "Coupon applied",
        description: `You saved ₹${discountAmount}`,
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Coupon not applied",
        description: error instanceof Error ? error.message : "Invalid or expired coupon.",
      });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      showToast({ variant: "error", title: "Your cart is empty" });
      return;
    }
  
    // Validate address depending on flow
    const usingSavedAddress = user && selectedAddressId && !showNewAddressForm;
  
    if (!usingSavedAddress && !isNewAddressValid()) {
      showToast({
        variant: "error",
        title: "Check your details",
        description: "Please fill in all required address fields correctly.",
      });
      return;
    }
  
    setPlacing(true);
  
    try {
      let orderId: string;
  
      if (user) {
        // Logged-in: use saved addressId, or save a new one first
        let addressIdToUse = selectedAddressId;
  
        if (!usingSavedAddress) {
          addressIdToUse = await createAddress({
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            postalCode: address.pincode,
            country: "India",
            isDefault: savedAddresses.length === 0,
          });
        }
  
        for (const item of items) {
          await addToServerCart(item.variantId, item.quantity);  
        }
  
        orderId = await createOrder({
          addressId: addressIdToUse!,
          couponCode: appliedCoupon?.code,
        });
      } else {
        // Guest: inline shipping snapshot, guest cart, no coupon support
        for (const item of items) {
          await addToGuestCart(item.variantId, item.quantity);
        }
  
        orderId = await createOrder({
          shipping: {
            shippingFullName: address.fullName,
            shippingPhone: address.phone,
            shippingAddressLine1: address.addressLine1,
            shippingAddressLine2: address.addressLine2,
            shippingCity: address.city,
            shippingState: address.state,
            shippingPostalCode: address.pincode,
            shippingCountry: "India",
          },
          guestEmail: address.email,
        });
      }
  
      const paymentData = await createPayment(orderId);
  
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast({
          variant: "error",
          title: "Payment failed to load",
          description: "Check your connection and try again.",
        });
        setPlacing(false);
        return;
      }
  
      const razorpay = new window.Razorpay({
        key: paymentData.key ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount: paymentData.amount ?? Math.round(total * 100),
        currency: "INR",
        name: "KK Store",
        description: `Order #${orderId}`,
        order_id: paymentData.razorpayOrderId ?? paymentData.orderId,
        prefill: {
          name: user?.firstName ? `${user.firstName} ${user.lastName}` : address.fullName,
          email: user?.email ?? address.email,
          contact: user?.phone ?? address.phone,
        },
        theme: { color: "#B08D57" },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
        
            clearCart();
            showToast({
              variant: "success",
              title: "Order placed!",
              description: `Payment ID: ${response.razorpay_payment_id}`,
            });
            router.push(`/order-confirmation?orderId=${orderId}`);
          } catch (error) {
            showToast({
              variant: "error",
              title: "Payment verification failed",
              description: error instanceof Error ? error.message : "Please contact support with your payment ID.",
            });
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      });
  
      razorpay.open();
    } catch (error) {
      console.error(error);
      showToast({
        variant: "error",
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
      });
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FAF7F2] px-6 text-center">
        <h1 className="font-[var(--font-playfair)] text-2xl text-[#2A1E17]">
          Your cart is empty
        </h1>
        <p className="mt-2 font-sans text-sm text-[#4A4A4A]">
          Add something to your cart before checking out.
        </p>
        <Link
          href="/products"
          className="mt-6 bg-[#B08D57] px-8 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#C9A96E]"
        >
          Shop Now
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-[#FAF7F2] px-6 py-12 md:px-12 lg:py-16">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="mb-10 font-[var(--font-playfair)] text-3xl text-[#2A1E17] sm:text-4xl">
          Checkout
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Shipping address */}
            <div className="border border-[#E8D8C5] bg-white p-6">
              <h2 className="mb-5 font-[var(--font-playfair)] text-lg text-[#2A1E17]">
                Shipping Address
              </h2>

              {user && loadingAddresses && (
                <div className="flex justify-center py-6">
                  <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-[#B08D57]" />
                </div>
              )}

              {/* Saved addresses list — logged-in users only */}
              {user && !loadingAddresses && savedAddresses.length > 0 && !showNewAddressForm && (
                <div className="space-y-3">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`flex w-full items-start gap-3 border p-4 text-left transition-colors duration-200 ${
                        selectedAddressId === addr.id
                          ? "border-[#B08D57] bg-[#B08D57]/5"
                          : "border-[#E8D8C5] hover:border-[#B08D57]/50"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          selectedAddressId === addr.id
                            ? "border-[#B08D57] bg-[#B08D57]"
                            : "border-[#E8D8C5]"
                        }`}
                      >
                        {selectedAddressId === addr.id && (
                          <Check size={10} strokeWidth={2.5} className="text-white" />
                        )}
                      </div>
                      <div className="font-sans text-xs text-[#2A1E17]">
                        <p className="font-medium">
                          {addr.fullName} {addr.isDefault && <span className="text-[#B08D57]">(Default)</span>}
                        </p>
                        <p className="mt-1 text-[#4A4A4A]">
                          {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                        <p className="mt-1 text-[#4A4A4A]">{addr.phone}</p>
                      </div>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="flex w-full items-center justify-center gap-2 border border-dashed border-[#B08D57]/50 py-3 font-sans text-xs uppercase tracking-[0.15em] text-[#B08D57] hover:bg-[#B08D57]/5"
                  >
                    <Plus size={14} strokeWidth={1.5} />
                    Use a New Address
                  </button>
                </div>
              )}

              {/* New address form — shown for guests, or when logged-in user opts to add new */}
              {(!user || showNewAddressForm || savedAddresses.length === 0) && !loadingAddresses && (
                <>
                  {user && savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="mb-4 font-sans text-xs text-[#B08D57] hover:underline"
                    >
                      ← Use a saved address instead
                    </button>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Full Name" value={address.fullName} onChange={(v) => updateField("fullName", v)} required />
                    <Field
                      label="Phone Number"
                      value={address.phone}
                      onChange={(v) => updateField("phone", v.replace(/\D/g, "").slice(0, 10))}
                      type="tel"
                      required
                    />
                    <Field
                      label="Email"
                      value={address.email}
                      onChange={(v) => updateField("email", v)}
                      type="email"
                      required
                      className="sm:col-span-2"
                    />
                    <Field
                      label="Address Line 1"
                      value={address.addressLine1}
                      onChange={(v) => updateField("addressLine1", v)}
                      required
                      className="sm:col-span-2"
                    />
                    <Field
                      label="Address Line 2 (Optional)"
                      value={address.addressLine2 ?? ""}
                      onChange={(v) => updateField("addressLine2", v)}
                      className="sm:col-span-2"
                    />
                    <Field label="City" value={address.city} onChange={(v) => updateField("city", v)} required />
                    <Field label="State" value={address.state} onChange={(v) => updateField("state", v)} required />
                    <Field
                      label="Pincode"
                      value={address.pincode}
                      onChange={(v) => updateField("pincode", v.replace(/\D/g, "").slice(0, 6))}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {/* Payment method */}
            <div className="border border-[#E8D8C5] bg-white p-6">
              <h2 className="mb-5 font-[var(--font-playfair)] text-lg text-[#2A1E17]">
                Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const selected = selectedPayment === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayment(method.id)}
                      className={`flex flex-col items-center gap-2 border p-4 transition-colors duration-200 ${
                        selected
                          ? "border-[#B08D57] bg-[#B08D57]/10"
                          : "border-[#E8D8C5] hover:border-[#B08D57]/50"
                      }`}
                    >
                      <Icon size={20} strokeWidth={1.5} className="text-[#B08D57]" />
                      <span className="text-center font-sans text-[11px] text-[#2A1E17]">
                        {method.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 flex items-center gap-2 font-sans text-xs text-[#4A4A4A]">
                <ShieldCheck size={14} strokeWidth={1.5} className="text-[#B08D57]" />
                All payments are secured and encrypted. Cash on Delivery is not available.
              </p>

              {!user && (
                <p className="mt-3 font-sans text-xs text-[#4A4A4A]">
                  <Link href="/login" className="text-[#B08D57] hover:underline">
                    Log in
                  </Link>{" "}
                  to save this address and apply coupons.
                </p>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-[#E8D8C5] bg-white p-6">
              <h2 className="mb-5 font-[var(--font-playfair)] text-lg text-[#2A1E17]">
                Order Summary
              </h2>

              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.color}-${item.size}`}
                    className="flex justify-between gap-3 font-sans text-xs text-[#4A4A4A]"
                  >
                    <span className="flex-1">
                      {item.name} ({item.color}, {item.size}) × {item.quantity}
                    </span>
                    <span className="shrink-0 text-[#2A1E17]">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-[#E8D8C5] pt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-[#B08D57]/10 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag size={14} strokeWidth={1.5} className="text-[#B08D57]" />
                      <span className="font-sans text-xs font-medium text-[#2A1E17]">
                        {appliedCoupon.code} applied
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      aria-label="Remove coupon"
                      className="text-[#4A4A4A] transition-colors hover:text-[#B5654F]"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="flex-1 border border-[#E8D8C5] bg-[#FAF7F2] px-3 py-2.5 font-sans text-xs uppercase tracking-wide text-[#2A1E17] outline-none transition-colors duration-200 focus:border-[#B08D57]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="shrink-0 border border-[#2A1E17] px-4 font-sans text-[10px] font-medium uppercase tracking-[0.15em] text-[#2A1E17] transition-colors duration-200 hover:bg-[#2A1E17] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {applyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3 border-t border-[#E8D8C5] pt-4 font-sans text-sm">
                <div className="flex justify-between text-[#4A4A4A]">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[#4A4A4A]">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : `₹${shippingCost}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#B08D57]">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between border-t border-[#E8D8C5] pt-4 font-sans text-base font-semibold text-[#2A1E17]">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 bg-[#B08D57] font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-[#2A1E17] transition-colors duration-300 hover:bg-[#C9A96E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placing ? (
                  <>
                    <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${total}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block font-sans text-xs text-[#2A1E17]">
        {label}
        {required && <span className="text-[#B5654F]"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#E8D8C5] bg-[#FAF7F2] px-3.5 py-2.5 font-sans text-sm text-[#2A1E17] outline-none transition-colors duration-200 focus:border-[#B08D57]"
      />
    </label>
  );
}