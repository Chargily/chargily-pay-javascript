import Joi from 'joi';

/**
 * Validation schemas for all Chargily API payloads.
 * Each schema corresponds to a parameter interface in src/types/param.ts
 */

/**
 * Shared schema describing a fully populated customer or shipping address.
 * @type {Joi.ObjectSchema}
 */
const addressSchema = Joi.object({
  country: Joi.string().required().messages({
    'string.empty': 'Country code is required',
    'any.required': 'Country code is required',
  }),
  state: Joi.string().required().messages({
    'string.empty': 'State is required',
    'any.required': 'State is required',
  }),
  address: Joi.string().required().messages({
    'string.empty': 'Address is required',
    'any.required': 'Address is required',
  }),
});

/**
 * Generic metadata container, allowing arbitrary key/value pairs.
 * @type {Joi.ObjectSchema}
 */
const metadataSchema = Joi.object().unknown(true).optional();

/**
 * Runtime validation for CreateCustomerParams payloads.
 * Ensures optional fields such as email or address respect formatting rules.
 * @type {Joi.ObjectSchema}
 */
export const createCustomerSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email must be a valid email address',
  }),
  phone: Joi.string().optional(),
  address: addressSchema.optional(),
  metadata: metadataSchema,
}).unknown(false);

/**
 * Runtime validation for UpdateCustomerParams payloads.
 * Mirrors the create schema while making every field optional, including nested address keys.
 * @type {Joi.ObjectSchema}
 */
export const updateCustomerSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email must be a valid email address',
  }),
  phone: Joi.string().optional(),
  address: Joi.object({
    country: Joi.string().optional(),
    state: Joi.string().optional(),
    address: Joi.string().optional(),
  }).unknown(false).optional(),
  metadata: metadataSchema,
}).unknown(false);

/**
 * Runtime validation for CreateProductParams payloads.
 * Requires the product name and validates media and metadata fields.
 * @type {Joi.ObjectSchema}
 */
export const createProductSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Product name is required',
    'any.required': 'Product name is required',
  }),
  description: Joi.string().optional(),
  images: Joi.array().items(Joi.string().uri()).optional().messages({
    'string.uri': 'Each image must be a valid URL',
  }),
  metadata: metadataSchema,
}).unknown(false);

/**
 * Runtime validation for UpdateProductParams payloads.
 * Keeps every field optional to support partial product updates.
 * @type {Joi.ObjectSchema}
 */
export const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  images: Joi.array().items(Joi.string().uri()).optional().messages({
    'string.uri': 'Each image must be a valid URL',
  }),
  metadata: metadataSchema,
}).unknown(false);

/**
 * Runtime validation for CreatePriceParams payloads.
 * Guards against missing or malformed monetary information.
 * @type {Joi.ObjectSchema}
 */
export const createPriceSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required',
  }),
  currency: Joi.string().lowercase().required().messages({
    'string.empty': 'Currency code is required',
    'any.required': 'Currency code is required',
  }),
  product_id: Joi.string().required().messages({
    'string.empty': 'Product ID is required',
    'any.required': 'Product ID is required',
  }),
  metadata: metadataSchema,
}).unknown(false);

/**
 * Runtime validation for UpdatePriceParams payloads.
 * Ensures metadata is always provided when updating a price object.
 * @type {Joi.ObjectSchema}
 */
export const updatePriceSchema = Joi.object({
  metadata: Joi.object().unknown(true).required().messages({
    'any.required': 'Metadata is required for price update',
  }),
}).unknown(false);

/**
 * Internal schema describing the structure of each checkout line item.
 * @type {Joi.ObjectSchema}
 */
const checkoutItemSchema = Joi.object({
  price: Joi.string().required().messages({
    'string.empty': 'Price ID is required',
    'any.required': 'Price ID is required',
  }),
  quantity: Joi.number().integer().positive().required().messages({
    'number.positive': 'Quantity must be a positive number',
    'number.integer': 'Quantity must be an integer',
    'any.required': 'Quantity is required',
  }),
}).unknown(false);

/**
 * Runtime validation for CreateCheckoutParams payloads.
 * Validates URLs and enforces the mutual exclusivity rule between items and amount/currency.
 * @type {Joi.ObjectSchema}
 */
export const createCheckoutSchema = Joi.object({
  items: Joi.array().items(checkoutItemSchema).optional(),
  amount: Joi.number().positive().optional().messages({
    'number.positive': 'Amount must be a positive number',
  }),
  currency: Joi.string().lowercase().optional(),
  payment_method: Joi.string().optional(),
  success_url: Joi.string().uri().required().messages({
    'string.uri': 'Success URL must be a valid URL (http or https)',
    'any.required': 'Success URL is required',
  }),
  failure_url: Joi.string().uri().optional().messages({
    'string.uri': 'Failure URL must be a valid URL',
  }),
  webhook_endpoint: Joi.string().uri().optional().messages({
    'string.uri': 'Webhook endpoint must be a valid URL',
  }),
  description: Joi.string().optional(),
  locale: Joi.string().valid('ar', 'en', 'fr').optional(),
  pass_fees_to_customer: Joi.boolean().optional(),
  customer_id: Joi.string().optional(),
  shipping_address: Joi.string().optional(),
  collect_shipping_address: Joi.boolean().optional(),
  metadata: metadataSchema,
})
  .unknown(false)
  .external(async (value) => {
    // Validate mutual exclusivity: either items OR (amount + currency)
    const hasItems = value.items && value.items.length > 0;
    const hasAmount = value.amount !== undefined;
    const hasCurrency = value.currency !== undefined;

    if (!hasItems && (!hasAmount || !hasCurrency)) {
      throw new Error(
        'Either items array or both amount and currency must be provided'
      );
    }

    if (hasItems && (hasAmount || hasCurrency)) {
      throw new Error(
        'Cannot provide both items and amount/currency together'
      );
    }
  });

/**
 * Internal schema describing each item attached to a payment link.
 * @type {Joi.ObjectSchema}
 */
const paymentLinkItemSchema = Joi.object({
  price: Joi.string().required().messages({
    'string.empty': 'Price ID is required',
    'any.required': 'Price ID is required',
  }),
  quantity: Joi.number().integer().positive().required().messages({
    'number.positive': 'Quantity must be a positive number',
    'number.integer': 'Quantity must be an integer',
    'any.required': 'Quantity is required',
  }),
  adjustable_quantity: Joi.boolean().optional(),
}).unknown(false);

/**
 * Runtime validation for CreatePaymentLinkParams payloads.
 * Requires a name and at least one well-formed item.
 * @type {Joi.ObjectSchema}
 */
export const createPaymentLinkSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Payment link name is required',
    'any.required': 'Payment link name is required',
  }),
  items: Joi.array().items(paymentLinkItemSchema).required().messages({
    'array.base': 'Items must be an array',
    'any.required': 'Items array is required',
  }),
  after_completion_message: Joi.string().optional(),
  locale: Joi.string().valid('ar', 'en', 'fr').optional(),
  pass_fees_to_customer: Joi.boolean().optional(),
  collect_shipping_address: Joi.boolean().optional(),
  metadata: metadataSchema,
}).unknown(false);

/**
 * Internal schema representing the mutable fields of each payment link item during updates.
 * @type {Joi.ObjectSchema}
 */
const updatePaymentLinkItemSchema = Joi.object({
  price: Joi.string().required().messages({
    'string.empty': 'Price ID is required',
    'any.required': 'Price ID is required',
  }),
  quantity: Joi.number().integer().positive().required().messages({
    'number.positive': 'Quantity must be a positive number',
    'number.integer': 'Quantity must be an integer',
    'any.required': 'Quantity is required',
  }),
  adjustable_quantity: Joi.boolean().optional(),
}).unknown(false);

/**
 * Runtime validation for UpdatePaymentLinkParams payloads.
 * Supports partial updates while keeping enum and type checks aligned with API expectations.
 * @type {Joi.ObjectSchema}
 */
export const updatePaymentLinkSchema = Joi.object({
  name: Joi.string().optional(),
  items: Joi.array().items(updatePaymentLinkItemSchema).optional(),
  after_completion_message: Joi.string().optional(),
  locale: Joi.string().valid('ar', 'en', 'fr').optional(),
  pass_fees_to_customer: Joi.boolean().optional(),
  collect_shipping_address: Joi.boolean().optional(),
  metadata: metadataSchema,
}).unknown(false);
