import { CHARGILY_LIVE_URL, CHARGILY_TEST_URL } from '../consts';
import {
  Balance,
  Checkout,
  Customer,
  PaymentLink,
  Price,
  Product,
  ProductPrice,
} from '../types/data';
import {
  CheckoutItemParams,
  CreateCheckoutParams,
  CreateCustomerParams,
  CreatePaymentLinkParams,
  CreatePriceParams,
  CreateProductParams,
  PaymentLinkItemParams,
  UpdateCustomerParams,
  UpdatePaymentLinkParams,
  UpdatePriceParams,
  UpdateProductParams,
} from '../types/param';
import { DeleteItemResponse, ListResponse } from '../types/response';

/**
 * Configuration options for ChargilyClient.
 */
export interface ChargilyClientOptions {
  /**
   * The API key for authentication with Chargily API.
   * @type {string}
   */
  api_key: string;

  /**
   * Operating mode of the client, indicating whether to use the test or live API endpoints.
   * @type {'test' | 'live'}
   */
  mode: 'test' | 'live';
}

/**
 * A client for interacting with Chargily's API, supporting operations for customers, products, prices, checkouts, and payment links.
 */
export class ChargilyClient {
  private api_key: string;
  private base_url: string;

  /**
   * Constructs a ChargilyClient instance.
   * @param {ChargilyClientOptions} options - Configuration options including API key and mode.
   */
  constructor(options: ChargilyClientOptions) {
    this.api_key = options.api_key;
    this.base_url =
      options.mode === 'test' ? CHARGILY_TEST_URL : CHARGILY_LIVE_URL;
  }

  /**
   * Internal method to make requests to the Chargily API.
   * @param {string} endpoint - The endpoint path to make the request to.
   * @param {string} [method='GET'] - The HTTP method for the request.
   * @param {Object} [body] - The request payload, necessary for POST or PATCH requests.
   * @returns {Promise<any>} - The JSON response from the API.
   * @private
   */
  private async request(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<any> {
    const url = `${this.base_url}/${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.api_key}`,
      'Content-Type': 'application/json',
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined) {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}: ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      throw new Error(`Failed to make API request: ${error}`);
    }
  }

  /**
   * Retrieves the current balance information from the Chargily API.
   * @returns {Promise<Balance>} - A promise that resolves to the balance information.
   */
  public async getBalance(): Promise<Balance> {
    return this.request('balance', 'GET');
  }

  /**
   * Creates a new customer with specified details.
   * @param {CreateCustomerParams} customer_data - The data for creating a new customer.
   * @returns {Promise<Customer>} - A promise that resolves to the newly created customer.
   */
  public async createCustomer(
    customer_data: CreateCustomerParams
  ): Promise<Customer> {
    return this.request('customers', 'POST', customer_data);
  }

  /**
   * Fetches a customer by their unique identifier.
   * @param {string} customer_id - The ID of the customer to retrieve.
   * @returns {Promise<Customer>} - A promise that resolves to the customer details.
   */
  public async getCustomer(customer_id: string): Promise<Customer> {
    return this.request(`customers/${customer_id}`, 'GET');
  }

  /**
   * Updates an existing customer's details.
   * @param {string} customer_id - The ID of the customer to update.
   * @param {UpdateCustomerParams} update_data - New data for updating the customer.
   * @returns {Promise<Customer>} - A promise that resolves to the updated customer details.
   */
  public async updateCustomer(
    customer_id: string,
    update_data: UpdateCustomerParams
  ): Promise<Customer> {
    return this.request(`customers/${customer_id}`, 'PATCH', update_data);
  }

  /**
   * Deletes a customer by their unique identifier.
   * @param {string} customer_id - The ID of the customer to delete.
   * @returns {Promise<DeleteItemResponse>} - A promise that resolves to the deletion response.
   */
  public async deleteCustomer(
    customer_id: string
  ): Promise<DeleteItemResponse> {
    return this.request(`customers/${customer_id}`, 'DELETE');
  }

  /**
   * Lists customers, optionally paginated.
   * @param {number} [per_page=10] - The number of customers to return per page.
   * @returns {Promise<ListResponse<Customer>>} - A promise that resolves to a paginated list of customers.
   */
  public async listCustomers(
    per_page: number = 10
  ): Promise<ListResponse<Customer>> {
    const endpoint = `customers?per_page=${per_page}`;
    const response: ListResponse<Customer> = await this.request(
      endpoint,
      'GET'
    );
    return response;
  }

  /**
   * Creates a new product with the given details.
   * @param {CreateProductParams} product_data - The data for creating the product.
   * @returns {Promise<Product>} The created product.
   */
  public async createProduct(
    product_data: CreateProductParams
  ): Promise<Product> {
    return this.request('products', 'POST', product_data);
  }

  /**
   * Updates an existing product identified by its ID.
   * @param {string} product_id - The ID of the product to update.
   * @param {UpdateProductParams} update_data - The data to update the product with.
   * @returns {Promise<Product>} The updated product.
   */
  public async updateProduct(
    product_id: string,
    update_data: UpdateProductParams
  ): Promise<Product> {
    return this.request(`products/${product_id}`, 'POST', update_data);
  }

  /**
   * Retrieves a single product by its ID.
   * @param {string} product_id - The ID of the product to retrieve.
   * @returns {Promise<Product>} The requested product.
   */
  public async getProduct(product_id: string): Promise<Product> {
    return this.request(`products/${product_id}`, 'GET');
  }

  /**
   * Lists all products with optional pagination.
   * @param {number} [per_page=10] - The number of products to return per page.
   * @returns {Promise<ListResponse<Product>>} A paginated list of products.
   */
  public async listProducts(
    per_page: number = 10
  ): Promise<ListResponse<Product>> {
    const endpoint = `products?per_page=${per_page}`;
    const response: ListResponse<Product> = await this.request(endpoint, 'GET');
    return response;
  }

  /**
   * Deletes a product by its ID.
   * @param {string} product_id - The ID of the product to delete.
   * @returns {Promise<DeleteItemResponse>} Confirmation of the product deletion.
   */
  public async deleteProduct(product_id: string): Promise<DeleteItemResponse> {
    return this.request(`products/${product_id}`, 'DELETE');
  }

  /**
   * Retrieves all prices associated with a product, with optional pagination.
   * @param {string} product_id - The ID of the product whose prices are to be retrieved.
   * @param {number} [per_page=10] - The number of prices to return per page.
   * @returns {Promise<ListResponse<ProductPrice>>} A paginated list of prices for the specified product.
   */
  public async getProductPrices(
    product_id: string,
    per_page: number = 10
  ): Promise<ListResponse<ProductPrice>> {
    const endpoint = `products/${product_id}/prices?per_page=${per_page}`;
    const response: ListResponse<ProductPrice> = await this.request(
      endpoint,
      'GET'
    );
    return response;
  }

  /**
   * Creates a new price for a product.
   * @param {CreatePriceParams} price_data - The details of the new price to be created.
   * @returns {Promise<Price>} The created price object.
   */
  public async createPrice(price_data: CreatePriceParams): Promise<Price> {
    return this.request('prices', 'POST', price_data);
  }

  /**
   * Updates the details of an existing price.
   * @param {string} price_id - The ID of the price to be updated.
   * @param {UpdatePriceParams} update_data - The new details for the price.
   * @returns {Promise<Price>} The updated price object.
   */
  public async updatePrice(
    price_id: string,
    update_data: UpdatePriceParams
  ): Promise<Price> {
    return this.request(`prices/${price_id}`, 'POST', update_data);
  }

  /**
   * Retrieves a single price by its ID.
   * @param {string} price_id - The ID of the price to retrieve.
   * @returns {Promise<Price>} The requested price object.
   */
  public async getPrice(price_id: string): Promise<Price> {
    return this.request(`prices/${price_id}`, 'GET');
  }

  /**
   * Lists all prices for products with optional pagination.
   * @param {number} [per_page=10] - The number of price objects to return per page.
   * @returns {Promise<ListResponse<Price>>} A paginated list of prices.
   */
  public async listPrices(per_page: number = 10): Promise<ListResponse<Price>> {
    const endpoint = `prices?per_page=${per_page}`;
    const response: ListResponse<Price> = await this.request(endpoint, 'GET');
    return response;
  }

  /**
   * Creates a new checkout session with the specified details.
   * @param {CreateCheckoutParams} checkout_data - The details for the new checkout session.
   * @returns {Promise<Checkout>} The created checkout object.
   */
  public async createCheckout(
    checkout_data: CreateCheckoutParams
  ): Promise<Checkout> {
    if (
      !checkout_data.success_url.startsWith('http') &&
      !checkout_data.success_url.startsWith('https')
    ) {
      throw new Error('Invalid success_url, it must begin with http or https.');
    }

    if (
      !checkout_data.items &&
      (!checkout_data.amount || !checkout_data.currency)
    ) {
      throw new Error(
        'The items field is required when amount and currency are not present.'
      );
    }

    return this.request('checkouts', 'POST', checkout_data);
  }

  /**
   * Retrieves details of a specific checkout session by its ID.
   * @param {string} checkout_id - The ID of the checkout session to retrieve.
   * @returns {Promise<Checkout>} The requested checkout object.
   */
  public async getCheckout(checkout_id: string): Promise<Checkout> {
    return this.request(`checkouts/${checkout_id}`, 'GET');
  }

  /**
   * Lists all checkout sessions with optional pagination.
   * @param {number} [per_page=10] - The number of checkout objects to return per page.
   * @returns {Promise<ListResponse<Checkout>>} A paginated list of checkout sessions.
   */
  public async listCheckouts(
    per_page: number = 10
  ): Promise<ListResponse<Checkout>> {
    const endpoint = `checkouts?per_page=${per_page}`;
    const response: ListResponse<Checkout> = await this.request(
      endpoint,
      'GET'
    );
    return response;
  }

  /**
   * Retrieves all items included in a specific checkout session, with optional pagination.
   * @param {string} checkout_id - The ID of the checkout session.
   * @param {number} [per_page=10] - The number of items to return per page.
   * @returns {Promise<ListResponse<CheckoutItemParams>>} A paginated list of items in the checkout session.
   */
  public async getCheckoutItems(
    checkout_id: string,
    per_page: number = 10
  ): Promise<ListResponse<CheckoutItemParams>> {
    const endpoint = `checkouts/${checkout_id}/items?per_page=${per_page}`;
    const response: ListResponse<CheckoutItemParams> = await this.request(
      endpoint,
      'GET'
    );
    return response;
  }

  /**
   * Expires a specific checkout session before its automatic expiration.
   * @param {string} checkout_id - The ID of the checkout session to expire.
   * @returns {Promise<Checkout>} The expired checkout object, indicating the session is no longer valid for payment.
   */
  public async expireCheckout(checkout_id: string): Promise<Checkout> {
    return this.request(`checkouts/${checkout_id}/expire`, 'POST');
  }

  /**
   * Creates a new payment link.
   * @param {CreatePaymentLinkParams} payment_link_data - The details for the new payment link.
   * @returns {Promise<PaymentLink>} The created payment link object.
   */
  public async createPaymentLink(
    payment_link_data: CreatePaymentLinkParams
  ): Promise<PaymentLink> {
    return this.request('payment-links', 'POST', payment_link_data);
  }

  /**
   * Updates an existing payment link identified by its ID.
   * @param {string} payment_link_id - The ID of the payment link to update.
   * @param {UpdatePaymentLinkParams} update_data - The new details for the payment link.
   * @returns {Promise<PaymentLink>} The updated payment link object.
   */
  public async updatePaymentLink(
    payment_link_id: string,
    update_data: UpdatePaymentLinkParams
  ): Promise<PaymentLink> {
    return this.request(
      `payment-links/${payment_link_id}`,
      'POST',
      update_data
    );
  }

  /**
   * Retrieves details of a specific payment link by its ID.
   * @param {string} payment_link_id - The ID of the payment link to retrieve.
   * @returns {Promise<PaymentLink>} The requested payment link object.
   */
  public async getPaymentLink(payment_link_id: string): Promise<PaymentLink> {
    return this.request(`payment-links/${payment_link_id}`, 'GET');
  }

  /**
   * Lists all payment links with optional pagination.
   * @param {number} [per_page=10] - The number of payment link objects to return per page.
   * @returns {Promise<ListResponse<PaymentLink>>} A paginated list of payment links.
   */
  public async listPaymentLinks(
    per_page: number = 10
  ): Promise<ListResponse<PaymentLink>> {
    const endpoint = `payment-links?per_page=${per_page}`;
    const response: ListResponse<PaymentLink> = await this.request(
      endpoint,
      'GET'
    );
    return response;
  }

  /**
   * Retrieves all items associated with a specific payment link, with optional pagination.
   * @param {string} payment_link_id - The ID of the payment link whose items are to be retrieved.
   * @param {number} [per_page=10] - The number of items to return per page.
   * @returns {Promise<ListResponse<PaymentLinkItemParams>>} A paginated list of items associated with the payment link.
   */
  public async getPaymentLinkItems(
    payment_link_id: string,
    per_page: number = 10
  ): Promise<ListResponse<PaymentLinkItemParams>> {
    const endpoint = `payment-links/${payment_link_id}/items?per_page=${per_page}`;
    const response: ListResponse<PaymentLinkItemParams> = await this.request(
      endpoint,
      'GET'
    );
    return response;
  }
}
