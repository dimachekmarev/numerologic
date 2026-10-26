// Payment Integration Module
// Яндекс Pay для России + Stripe для международного рынка

export const PAYMENT_PROVIDERS = {
  RU: "yandex_pay",
  INTERNATIONAL: "stripe",
};

// Конфигурация Яндекс Pay
export const YANDEX_PAY_CONFIG = {
  shopId: process.env.YANDEX_PAY_SHOP_ID,
  secretKey: process.env.YANDEX_PAY_SECRET_KEY,
  testMode: process.env.NODE_ENV !== "production",
  currency: "RUB",
  paymentMethods: ["yandex_pay", "bank_card", "sbp"],
};

// Конфигурация Stripe
export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: "usd", // или eur для Европы
};

// Создание платежа через Яндекс Pay
export async function createYandexPayPayment({ amount, orderId, email, description }) {
  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": orderId,
      Authorization: `Basic ${btoa(`${YANDEX_PAY_CONFIG.shopId}:${YANDEX_PAY_CONFIG.secretKey}`)}`,
    },
    body: JSON.stringify({
      amount: {
        value: amount.toFixed(2),
        currency: YANDEX_PAY_CONFIG.currency,
      },
      confirmation: {
        type: "redirect",
        return_url: `${window.location.origin}/checkout/success?order_id=${orderId}`,
      },
      capture: true,
      description,
      metadata: {
        order_id: orderId,
      },
      receipt: {
        customer: {
          email,
        },
        items: [
          {
            description,
            quantity: "1.00",
            amount: {
              value: amount.toFixed(2),
              currency: YANDEX_PAY_CONFIG.currency,
            },
            vat_code: 1,
            payment_mode: "full_payment",
            payment_subject: "service",
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Yandex Pay error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    paymentId: data.id,
    confirmationUrl: data.confirmation.confirmation_url,
  };
}

// Создание платежа через Stripe
export async function createStripePayment({ amount, orderId, email, description }) {
  const response = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      orderId,
      email,
      description,
      successUrl: `${window.location.origin}/checkout/success?order_id=${orderId}`,
      cancelUrl: `${window.location.origin}/checkout/cancel?order_id=${orderId}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Stripe error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    sessionId: data.sessionId,
    checkoutUrl: data.url,
  };
}

// Определение региона пользователя
export function detectUserRegion() {
  const lang = navigator.language || navigator.userLanguage;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Россия
  if (lang.startsWith("ru") || timezone.includes("Moscow")) {
    return "RU";
  }

  // СНГ
  if (["uk", "be", "kk"].some(l => lang.startsWith(l))) {
    return "CIS";
  }

  // Международный
  return "INTERNATIONAL";
}

// Выбор платёжного провайдера
export function getPaymentProvider() {
  const region = detectUserRegion();
  return region === "RU" || region === "CIS"
    ? PAYMENT_PROVIDERS.RU
    : PAYMENT_PROVIDERS.INTERNATIONAL;
}

// Универсальная функция создания платежа
export async function createPayment({ amount, orderId, email, description }) {
  const provider = getPaymentProvider();

  if (provider === PAYMENT_PROVIDERS.RU) {
    return createYandexPayPayment({ amount, orderId, email, description });
  } else {
    return createStripePayment({ amount, orderId, email, description });
  }
}

// Обработка webhook от Яндекс Pay
export function handleYandexPayWebhook(event) {
  // Проверка подписи
  const signature = event.headers["authorization"];
  if (!verifyYandexPaySignature(signature, event.body)) {
    throw new Error("Invalid signature");
  }

  const { event: eventType, object } = JSON.parse(event.body);

  switch (eventType) {
    case "payment.succeeded":
      return {
        status: "paid",
        orderId: object.metadata.order_id,
        paymentId: object.id,
        amount: parseFloat(object.amount.value),
      };

    case "payment.canceled":
      return {
        status: "canceled",
        orderId: object.metadata.order_id,
        paymentId: object.id,
      };

    case "refund.succeeded":
      return {
        status: "refunded",
        orderId: object.metadata.order_id,
        paymentId: object.payment_id,
        amount: parseFloat(object.amount.value),
      };

    default:
      console.warn(`Unknown Yandex Pay event: ${eventType}`);
      return null;
  }
}

// Обработка webhook от Stripe
export function handleStripeWebhook(event) {
  switch (event.type) {
    case "checkout.session.completed":
      return {
        status: "paid",
        orderId: event.data.object.metadata.order_id,
        paymentId: event.data.object.payment_intent,
        amount: event.data.object.amount_total / 100,
        email: event.data.object.customer_details.email,
      };

    case "payment_intent.payment_failed":
      return {
        status: "failed",
        orderId: event.data.object.metadata.order_id,
        paymentId: event.data.object.id,
      };

    case "charge.refunded":
      return {
        status: "refunded",
        orderId: event.data.object.metadata.order_id,
        paymentId: event.data.object.payment_intent,
        amount: event.data.object.amount_refunded / 100,
      };

    default:
      console.warn(`Unknown Stripe event: ${event.type}`);
      return null;
  }
}

// Проверка подписи Яндекс Pay
function verifyYandexPaySignature(signature, body) {
  // TODO: Implement signature verification
  // https://yookassa.ru/developers/using-api/webhooks
  return true; // Placeholder
}

// Возврат платежа
export async function refundPayment(paymentId, amount, provider) {
  if (provider === PAYMENT_PROVIDERS.RU) {
    return refundYandexPay(paymentId, amount);
  } else {
    return refundStripe(paymentId, amount);
  }
}

async function refundYandexPay(paymentId, amount) {
  const response = await fetch("https://api.yookassa.ru/v3/refunds", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": `refund_${paymentId}_${Date.now()}`,
      Authorization: `Basic ${btoa(`${YANDEX_PAY_CONFIG.shopId}:${YANDEX_PAY_CONFIG.secretKey}`)}`,
    },
    body: JSON.stringify({
      payment_id: paymentId,
      amount: {
        value: amount.toFixed(2),
        currency: YANDEX_PAY_CONFIG.currency,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Yandex Pay refund error: ${response.statusText}`);
  }

  return response.json();
}

async function refundStripe(paymentIntentId, amount) {
  const response = await fetch("/api/stripe/refund", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentIntentId,
      amount: Math.round(amount * 100), // Stripe использует центы
    }),
  });

  if (!response.ok) {
    throw new Error(`Stripe refund error: ${response.statusText}`);
  }

  return response.json();
}
