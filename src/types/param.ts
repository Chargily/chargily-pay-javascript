import { Address } from './data';

export interface CreateCustomerParams {
  /** The name of the customer. */
  name?: string;

  /** The email address of the customer. */
  email?: string;

  /** The phone number of the customer. */
  phone?: string;

  /** The address of the customer. */
  address?: Address;

  /** A set of key-value pairs for additional information about the customer. */
  metadata?: Record<string, any>;
}

export interface UpdateCustomerParams {
  /** Optional: The name of the customer. */
  name?: string;

  /** Optional: The email address of the customer. */
  email?: string;

  /** Optional: The phone number of the customer. */
  phone?: string;

  /** Optional: The address of the customer, with all fields inside also being optional. */
  address?: Partial<Address>;

  /** Optional: A set of key-value pairs for additional information about the customer. */
  metadata?: Record<string, any>;
}

export interface CreateProductParams {
  /** Required: The name of the product. */
  name: string;

  /** Optional: The description of the product. */
  description?: string;

  /** Optional: URLs of images of the product, up to 8. */
  images?: string[];

  /** Optional: A set of key-value pairs for additional information about the product. */
  metadata?: Record<string, any>;
}

export interface UpdateProductParams {
  /** Optional: The name of the product. */
  name?: string;

  /** Optional: The description of the product. */
  description?: string;

  /** Optional: URLs of images of the product. */
  images?: string[];

  /** Optional: A set of key-value pairs for additional information about the product. */
  metadata?: Record<string, any>;
}

export interface CreatePriceParams {
  /** Required: The amount to be charged. */
  amount: number;

  /** Required: A lowercase ISO currency code, e.g., "dzd". */
  currency: string;

  /** Required: The ID of the product. */
  product_id: string;

  /** Optional: A set of key-value pairs for additional information. */
  metadata?: Record<string, any>;
}

export interface UpdatePriceParams {
  /** A set of key-value pairs for additional information about the price. */
  metadata: Record<string, any>;
}

export interface CheckoutItemParams {
  /** Required: The ID of the Price associated with the item. */
  price: string;

  /** Required: The quantity of the item being purchased. */
  quantity: number;
}

export interface CreateCheckoutParams {
  /** Required if amount and currency are not provided: An array of items being purchased. */
  items?: CheckoutItemParams[];

  /** Required if items are not provided: The total amount of the checkout. */
  amount?: number;

  /** Required if amount is provided: The currency code for the checkout. */
  currency?: string;

  /** Optional: The payment method for the checkout, defaults to "edahabia". */
  payment_method?: string;

  /** Required: The URL to redirect to after a successful payment, must be a valid URL that begins with either http or https. */
  success_url: string;

  /** Optional: The URL to redirect to after a failed or canceled payment. */
  failure_url?: string;

  /** Optional: The URL for receiving webhook events. */
  webhook_endpoint?: string;

  /** Optional: A description of the checkout. */
  description?: string;

  /** Optional: The language of the checkout page. */
  locale?: 'ar' | 'en' | 'fr';

  /** Optional: Indicates who will pay the Chargily Pay fees. */
  pass_fees_to_customer?: boolean;

  /** Optional: The ID of an existing customer. */
  customer_id?: string;

  /** Optional: The shipping address for the checkout. */
  shipping_address?: string;

  /** Optional: Indicates whether the shipping address should be collected. */
  collect_shipping_address?: boolean;

  /** Optional
: Additional information about the checkout. */
  metadata?: Record<string, any>;
}

export interface PaymentLinkItemParams {
  /** Required: The ID of the Price associated with the item. */
  price: string;

  /** Required: The quantity of the item being offered. */
  quantity: number;

  /** Optional: Indicates if the quantity is adjustable by the customer. Defaults to false. */
  adjustable_quantity?: boolean;
}

export interface CreatePaymentLinkParams {
  /** Required: A descriptive name for the payment link. */
  name: string;

  /** Required: An array of items included in the payment link. */
  items: PaymentLinkItemParams[];

  /** Optional: A message displayed to the customer after a successful payment. */
  after_completion_message?: string;

  /** Optional: The language of the checkout page. */
  locale?: 'ar' | 'en' | 'fr';

  /** Optional: Indicates who will pay the Chargily Pay fees. */
  pass_fees_to_customer?: boolean;

  /** Optional: Indicates whether the shipping address should be collected. */
  collect_shipping_address?: boolean;

  /** Optional: Additional information about the payment link. */
  metadata?: Record<string, any>;
}

export interface UpdatePaymentLinkItem {
  /** Required: The ID of the Price associated with the item. */
  price: string;

  /** Required: The quantity of the item being offered. */
  quantity: number;

  /** Optional: Indicates if the quantity is adjustable by the customer. Defaults to false. */
  adjustable_quantity?: boolean;
}

export interface UpdatePaymentLinkParams {
  /** Optional: A descriptive name for the payment link. */
  name?: string;

  /** Optional: An array of items included in the payment link. */
  items?: UpdatePaymentLinkItem[];

  /** Optional: A message displayed to the customer after a successful payment. */
  after_completion_message?: string;

  /** Optional: The language of the checkout page. */
  locale?: 'ar' | 'en' | 'fr';

  /** Optional: Indicates who will pay the Chargily Pay fees. */
  pass_fees_to_customer?: boolean;

  /** Optional: Indicates whether the shipping address should be collected. */
  collect_shipping_address?: boolean;

  /** Optional: Additional information about the payment link. */
  metadata?: Record<string, any>;
}
