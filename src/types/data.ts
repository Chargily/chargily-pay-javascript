/** Represents a wallet with its currency and balances. */
export interface Wallet {
  /** A lowercase ISO currency code. */
  currency: string;

  /** The total balance available in the wallet. */
  balance: number;

  /** The amount available for payout. */
  ready_for_payout: number;

  /** The amount currently on hold. */
  on_hold: number;
}

/** Represents the balance object containing wallet information. */
export interface Balance {
  /** A string representing the type of the object. */
  entity: string;

  /** True for Live Mode, False for Test Mode. */
  livemode: boolean;

  /** An array of wallet objects for each currency. */
  wallets: Wallet[];
}

/** Represents a physical address with country, state, and detailed address. */
export interface Address {
  /** Two-letter country code (ISO 3166-1 alpha-2). */
  country: string;

  /** The state or region of the address. */
  state: string;

  /** Detailed address line including street name, number, etc. */
  address: string;
}

/** Represents a customer with their personal and contact information. */
export interface Customer {
  /** Unique identifier of the customer. */
  id: string;

  /** A string representing the type of the object. */
  entity: string;

  /** True for Live Mode, False for Test Mode. */
  livemode: boolean;

  /** Full name of the customer. */
  name: string;

  /** Email address of the customer. Can be null if not provided. */
  email: string | null;

  /** Phone number of the customer. Can be null if not provided. */
  phone: string | null;

  /** Physical address of the customer. Can be null if not provided. */
  address: Address | null;

  /** A set of key-value pairs that can be used to store additional information about the customer. */
  metadata: Record<string, any>;

  /** Timestamp indicating when the customer was created. */
  created_at: number;

  /** Timestamp indicating when the customer was last updated. */
  updated_at: number;
}

/** Represents a product with its details and associated metadata. */
export interface Product {
  /** Unique identifier of the product. */
  id: string;

  /** A string representing the type of the object. */
  entity: string;

  /** True for Live Mode, False for Test Mode. */
  livemode: boolean;

  /** Name of the product. */
  name: string;

  /** Description of the product. Can be null if not provided. */
  description: string | null;

  /** Array of image URLs associated with the product. */
  images: string[];

  /** A set of key-value pairs that can be used to store additional information about the product. */
  metadata: Record<string, any>;

  /** Timestamp indicating when the product was created. */
  created_at: number;

  /** Timestamp indicating when the product was last updated. */
  updated_at: number;
}

/** Represents a price object associated with a product. */
export interface ProductPrice {
  /** Unique identifier of the price. */
  id: string;

  /** A string representing the type of the object, "price" in this context. */
  entity: string;

  /** The amount specified for this price. */
  amount: number;

  /** The currency code for the price, e.g., "dzd". */
  currency: string;

  /** Metadata associated with the price. Can be null. */
  metadata: Record<string, any> | null;

  /** Timestamp indicating when the price was created. */
  created_at: number;

  /** Timestamp indicating when the price was last updated. */
  updated_at: number;

  /** The product ID associated with this price. */
  product_id: string;
}

/** Represents a price object with additional product association. */
export interface Price {
  /** Unique identifier of the price. */
  id: string;

  /** A string representing the type of the object. */
  entity: string;

  /** True for Live Mode, False for Test Mode. */
  livemode: boolean;

  /** The amount specified for this price. */
  amount: number;

  /** The currency code for the price, e.g., "dzd". */
  currency: string;

  /** The product ID associated with this price. */
  product_id: string;
  /** A set of key-value pairs that can be used to store additional information about the price. */
  metadata: Record<string, any>;

  /** Timestamp indicating when the price was created. */
  created_at: number;

  /** Timestamp indicating when the price was last updated. */
  updated_at: number;
}

/** Represents a checkout object with details of the transaction. */
export interface Checkout {
  /* Unique identifier of the checkout. */
  id: string;

  /** A string representing the type of the object. */
  entity: string;

  /** True for Live Mode, False for Test Mode. */
  livemode: boolean;

  /** The total amount of the transaction. */
  amount: number;

  /** The currency code for the transaction. */
  currency: string;

  /** The fees associated with the transaction. */
  fees: number;

  /** Indicates whether the fees are passed to the customer. */
  pass_fees_to_customer: boolean;

  /** The current status of the checkout. */
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'canceled';

  /** The language of the checkout page. */
  locale: 'ar' | 'en' | 'fr';

  /** A description of the transaction. */
  description: string;

  /** The URL to which the customer will be redirected after a successful payment. */
  success_url: string;

  /** The URL to which the customer will be redirected after a failed or canceled payment. */
  failure_url: string;

  /** The webhook endpoint for receiving payment events. */
  webhook_endpoint: string;

  /** The payment method used, can be null if not specified. */
  payment_method: string | null;

  /** The invoice ID associated with the payment, can be null if not specified. */
  invoice_id: string | null;

  /** The customer ID associated with the payment, can be null if not specified. */
  customer_id: string | null;

  /** The payment link ID associated with the payment, can be null if not specified. */
  payment_link_id: string | null;

  /** A set of key-value pairs that can be used to store additional information about the checkout. */
  metadata: Record<string, any>;

  /** Timestamp indicating when the checkout was created. */
  created_at: number;

  /** Timestamp indicating when the checkout was last updated. */
  updated_at: number;

  /** The shipping address for the checkout. */
  shipping_address: Address;

  /** Indicates whether the shipping address should be collected. */
  collect_shipping_address: boolean;

  /** The URL for the checkout page where the customer completes the payment. */
  checkout_url: string;
}

/** Represents an individual item within a checkout. */
export interface CheckoutItem {
  /* Unique identifier of the checkout item. */
  id: string;

  /** A string representing the type of the object, "price" in this context. */
  entity: string;

  /** The amount specified for this checkout item. */
  amount: number;

  /** The quantity of the item being purchased. */
  quantity: number;

  /** The currency code for the item, e.g., "dzd". */
  currency: string;

  /** Metadata associated with the item. Can be null. */
  metadata: Record<string, any> | null;

  /** Timestamp indicating when the checkout item was created. */
  created_at: number;

  /** Timestamp indicating when the checkout item was last updated. */
  updated_at: number;

  /** The product ID associated with this checkout item. */
  product_id: string;
}

/** Represents a payment link object with details for a transaction. */
export interface PaymentLink {
  /* Unique identifier of the payment link. */
  id: string;

  /** A string representing the type of the object. */
  entity: string;

  /** True for Live Mode, False for Test Mode. */
  livemode: boolean;

  /** The name or title of the payment

link. */
  name: string;

  /** Indicates whether the payment link is active and can be used by customers. */
  active: boolean;

  /** A message to be displayed to the customer after a successful payment. */
  after_completion_message: string;

  /** The language of the checkout page associated with the payment link. */
  locale: 'ar' | 'en' | 'fr';

  /** Indicates whether the Chargily Pay fees will be paid by the merchant or passed to the customers. */
  pass_fees_to_customer: boolean;

  /** A set of key-value pairs that can be used to store additional information about the payment link. */
  metadata: Record<string, any>;

  /** Timestamp indicating when the payment link was created. */
  created_at: number;

  /** Timestamp indicating when the payment link was last updated. */
  updated_at: number;

  /** Indicates whether the customer is prompted to provide a shipping address. */
  collect_shipping_address: boolean;

  /** The URL of the payment link that customers can visit to make a payment. */
  url: string;
}

/** Represents an individual item within a payment link. */
export interface PaymentLinkItem {
  /* Unique identifier of the payment link item. */
  id: string;

  /** A string representing the type of the object, "price" in this context. */
  entity: string;

  /** The amount specified for this payment link item. */
  amount: number;

  /** The quantity of the item offered in the payment link. */
  quantity: number;

  /** Indicates if the quantity is adjustable by the customer. */
  adjustable_quantity: boolean;

  /** The currency code for the item, e.g., "dzd". */
  currency: string;

  /** Metadata associated with the item. Can be null. */
  metadata: Record<string, any> | null;

  /** Timestamp indicating when the payment link item was created. */
  created_at: number;

  /** Timestamp indicating when the payment link item was last updated. */
  updated_at: number;

  /** The product ID associated with this payment link item. */
  product_id: string;
}
