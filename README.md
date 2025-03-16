# Welcome to JavaScript Package Repository
# for [Chargily Pay](https://chargily.com/business/pay "Chargily Pay")™ Gateway - V2.

Thank you for your interest in JS Package of Chargily Pay™, an open source project by Chargily, a leading fintech company in Algeria specializing in payment solutions and  e-commerce facilitating, this Package is providing the easiest and free way to integrate e-payment API through widespread payment methods in Algeria such as EDAHABIA (Algerie Post) and CIB (SATIM) into your JavaScript/Node.js back-end projects.

**IMPORTANT: This package is meant to be ONLY used in the server-side**

This package is developed by **Abderraouf Zine ([ruzolut](https://github.com/ruzolut))** and is open to contributions from developers like you.


## Key Features

- Easy integration with Chargily Pay e-payment gateway
- Support for both EDAHABIA of Algerie Poste and CIB of SATIM
- Comprehensive management of customers, products, and prices
- Efficient handling of checkouts and payment links
- Compatible with Node.js and browser environments
- Support for webhooks.

## Installation

To include this library in your project, you can use npm or yarn:

```shell
npm install @chargily/chargily-pay
```

or

```shell
yarn add @chargily/chargily-pay
```

## Getting Started

Before utilizing the library, you must configure it with your [Chargily API key](https://dev.chargily.com/pay-v2/api-keys) and specify the mode (test or live). Here's an example to get started:

```ts
import { ChargilyClient } from '@chargily/chargily-pay';

const client = new ChargilyClient({
  api_key: 'YOUR_API_SECRET_KEY_HERE',
  mode: 'test', // Change to 'live' when deploying your application
});
```

This initializes the Chargily client, ready for communication with the Chargily Pay API.

## Webhooks Notice

**Important Notice:**

Using webhooks is only suitable for back-end environments.

Webhooks allow your application to react to events from Chargily Pay by receiving HTTP requests with JSON payloads. To set up and handle webhooks securely, you must implement them on a server-side environment. This ensures the proper verification and processing of webhook events without exposing sensitive information or risking security issues.

When implementing webhooks:

1. **Verify the Signature:** Ensure the request is legitimate and untampered.
2. **Identify the Event:** Use the event type to determine the action.
3. **Handle the Event:** Execute the necessary actions based on the event type.
4. **Respond with 200:** Confirm receipt of the webhook.

### Example Webhook Endpoint

We will be using express for this example, so first let's install some dependencies.

```shell
npm install express body-parser
```

Then install the needed types for express

```shell
npm i @types/express --save-dev
```

Now, here's how you can set up a secure webhook endpoint using Express:

```ts
import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import { verifySignature } from '@chargily/chargily-pay';

const API_SECRET_KEY = 'YOUR_API_SECRET_KEY_HERE';

const app = express();
const port = 4000;

// Middleware to capture raw body as Buffer
app.use(
  bodyParser.json({
    verify: (req: Request, res: Response, buf: Buffer) => {
      (req as any).rawBody = buf;
    },
  })
);

app.post('/webhook', (req: Request, res: Response) => {
  const signature = req.get('signature') || '';
  const payload = (req as any).rawBody;

  if (!signature) {
    console.log('Signature header is missing');
    res.sendStatus(400);
    return;
  }

  try {
    if (!verifySignature(payload, signature, API_SECRET_KEY)) {
      console.log('Signature is invalid');
      res.sendStatus(403);
      return;
    }
  } catch (error) {
    console.log(
      'Something happened while trying to process the request to the webhook'
    );
    res.sendStatus(403);
    return;
  }

  const event = req.body;
  // You can use the event.type here to implement your own logic
  console.log(event);

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

One more thing, if you wish to test your local webhook, we recommend using a tool like [NGROK](https://ngrok.com).

You can run ngrok to open a tunnel to your local machine using this command

```shell
ngrok http 4000 # or the port you are using
```

Ngrok will then return a public endpoint that you can add to Chargily's dashboard, by going [here](https://pay.chargily.com/test/dashboard/developers-corner) and pasting your endpoint in the webhook endpoint field. Also, make sure you don't forget to add `/webhook` or whatever url extension you used to the URL you paste there.

## Creating a Customer

To create a customer, you can use the `createCustomer` method:

```ts
const customerData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+213xxxxxxxx',
  address: {
    country: 'DZ',
    state: 'Algiers',
    address: '123 Main St',
  },
  metadata: {
    notes: 'Important customer',
  },
};

client
  .createCustomer(customerData)
  .then((customer) => console.log(customer))
  .catch((error) => console.error(error));
```

This method returns a promise with the created customer object.

## Updating a Customer

To update an existing customer, use the `updateCustomer` method with the customer's ID and the data you want to update:

```ts
const updateData = {
  email: 'new.email@example.com',
  metadata: { notes: 'Updated customer info' },
};

client
  .updateCustomer('customer_id_here', updateData)
  .then((customer) => console.log(customer))
  .catch((error) => console.error(error));
```

This will update the specified fields of the customer and return the updated customer object.

## Creating a Product

To create a new product, you can use the `createProduct` method. Here's how to create a product named "Super Product":

```ts
const productData = {
  name: 'Super Product',
  description: 'An amazing product that does everything!',
  images: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
  metadata: { category: 'electronics' },
};

client
  .createProduct(productData)
  .then((product) => console.log(product))
  .catch((error) => console.error(error));
```

This method requires the `name` of the product and optionally accepts `description`, an array of `images`, and `metadata`.

## Deleting a Customer

To delete a customer from the Chargily Pay system, you can use the `deleteCustomer` method with the customer's ID:

```ts
client
  .deleteCustomer('customer_id_here')
  .then((response) => console.log(response))
  .catch((error) => console.error(error));
```

This method will return a response indicating whether the deletion was successful.

## Listing Customers

You can list all customers with optional pagination using the `listCustomers` method. Specify the number of customers per page using the `per_page` parameter:

```ts
client
  .listCustomers(20) // List 20 customers per page
  .then((customersList) => console.log(customersList))
  .catch((error) => console.error(error));
```

The response will include a paginated list of customers along with pagination details.

## Updating a Customer

To update an existing customer, you'll need the customer's ID:

```ts
const updatedCustomer = await client.updateCustomer('CUSTOMER_ID', {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '987654321',
  address: {
    country: 'DZ',
    state: 'Oran',
    address: '4321 Main St',
  },
  metadata: {
    custom_field_updated: 'new value',
  },
});
```

This call updates the specified customer and returns the updated customer object.

## Deleting a Customer

To delete a customer, use their ID:

```ts
const deleteResponse = await client.deleteCustomer('CUSTOMER_ID');
```

This method returns a response indicating whether the deletion was successful.

## Creating a Product

To add a new product to your catalog:

```ts
const newProduct = await client.createProduct({
  name: 'Awesome Product',
  description: 'A description of your awesome product',
  images: ['https://example.com/image.png'],
  metadata: {
    category: 'Electronics',
  },
});
```

This creates a new product and returns the product object.

## Updating a Product

Similar to customers, you can update products using their ID:

```ts
const updatedProduct = await client.updateProduct('PRODUCT_ID', {
  name: 'Even More Awesome Product',
  description: 'An updated description',
  images: ['https://example.com/newimage.png'],
  metadata: {
    category: 'Updated Category',
  },
});
```

This updates the product details and returns the updated product object.

## Creating a Price

To create a price for a product, you need the product's ID:

```ts
const newPrice = await client.createPrice({
  amount: 5000,
  currency: 'dzd',
  product_id: 'PRODUCT_ID',
  metadata: {
    size: 'M',
  },
});
```

This creates a new price for the specified product and returns the price object.

## Updating a Price

You can update the metadata of a price by its ID:

```ts
const updatedPrice = await client.updatePrice('PRICE_ID', {
  metadata: {
    size: 'L',
  },
});
```

This updates the price's metadata and returns the updated price object.

## Creating a Checkout

To create a checkout session for a customer to make a payment:

```ts
const checkout = await client.createCheckout({
  items: [
    {
      price: 'PRICE_ID',
      quantity: 1,
    },
  ],
  success_url: 'https://your-website.com/success',
  failure_url: 'https://your-website.com/failure',
  payment_method: 'edahabia', // Optional, defaults to 'edahabia'
  locale: 'en', // Optional, defaults to 'ar'
  pass_fees_to_customer: true, // Optional, defaults to false
  shipping_address: '123 Test St, Test City, DZ', // Optional
  collect_shipping_address: true, // Optional, defaults to false
  metadata: {
    order_id: '123456',
  },
});
```

This creates a new checkout session and returns the checkout object, including a `checkout_url` where you can redirect your customer to complete their payment.

## Creating a Payment Link

Payment links are URLs that you can share with your customers for payment:

```ts
const paymentLink = await client.createPaymentLink({
  name: 'Product Payment',
  items: [
    {
      price: 'PRICE_ID',
      quantity: 1,
      adjustable_quantity: false,
    },
  ],
  after_completion_message: 'Thank you for your purchase!',
  locale: 'en',
  pass_fees_to_customer: true,
  collect_shipping_address: true,
  metadata: {
    campaign: 'Summer Sale',
  },
});
```

This creates a new payment link and returns the payment link object, including the URL that you can share with your customers.

## Handling Prices

### Creating a Price

To set up a price for a product, you can use the product's ID:

```ts
const newPrice = await client.createPrice({
  amount: 5000,
  currency: 'dzd',
  product_id: 'PRODUCT_ID',
  metadata: {
    discount: '10%',
  },
});
```

This call creates a new price for the specified product and returns the price object.

### Updating a Price

Update a price by its ID:

```ts
const updatedPrice = await client.updatePrice('PRICE_ID', {
  metadata: {
    discount: '15%',
  },
});
```

This updates the metadata for the price and returns the updated price object.

### Fetching Prices

To retrieve all prices for a product:

```ts
const prices = await client.listPrices();
```

This returns a paginated list of all prices.

## Working with Checkouts

### Creating a Checkout

Creating a checkout is a crucial step for initiating a payment process. A checkout can be created by specifying either a list of items (products and quantities) or a total amount directly. You also need to provide a success URL and optionally a failure URL where your customer will be redirected after the payment process.

Here's how you can create a checkout:

```ts
const newCheckout = await client.createCheckout({
  items: [
    { price: 'PRICE_ID', quantity: 2 },
    { price: 'ANOTHER_PRICE_ID', quantity: 1 },
  ],
  success_url: 'https://yourdomain.com/success',
  failure_url: 'https://yourdomain.com/failure',
  payment_method: 'edahabia',
  customer_id: 'CUSTOMER_ID',
  metadata: { orderId: '123456' },
  locale: 'en',
  pass_fees_to_customer: false,
});
```

This request creates a new checkout session and returns the checkout object, including a `checkout_url` where you should redirect your customer to complete the payment.

### Retrieving a Checkout

To fetch details of a specific checkout session:

```ts
const checkoutDetails = await client.getCheckout('CHECKOUT_ID');
```

This retrieves the details of the specified checkout session.

## Managing Payment Links

### Creating a Payment Link

Payment Links provide a versatile way to request payments by generating a unique URL that you can share with your customers. Here's how to create one:

```ts
const paymentLink = await client.createPaymentLink({
  name: 'Subscription Service',
  items: [{ price: 'PRICE_ID', quantity: 1, adjustable_quantity: false }],
  after_completion_message: 'Thank you for your subscription!',
  locale: 'en',
  pass_fees_to_customer: true,
  collect_shipping_address: true,
  metadata: { subscriptionId: 'sub_12345' },
});
```

This creates a new payment link with specified details and returns the payment link object including the URL to be shared with your customers.

### Updating a Payment Link

To update an existing payment link:

```ts
const updatedLink = await client.updatePaymentLink('PAYMENT_LINK_ID', {
  name: 'Updated Subscription Service',
  after_completion_message: 'Thank you for updating your subscription!',
  metadata: { subscriptionId: 'sub_67890' },
});
```

This updates the specified payment link and returns the updated object.

### Fetching a Payment Link

Retrieve the details of a specific payment link:

```ts
const linkDetails = await client.getPaymentLink('PAYMENT_LINK_ID');
```

This call retrieves the specified payment link's details.

### Listing Payment Links

To list all your payment links:

```ts
const allLinks = await client.listPaymentLinks();
```

This returns a paginated list of all payment links you've created.


## About Chargily Pay™ packages

Chargily Pay™ packages/plugins are a collection of open source projects published by Chargily to facilitate the integration of our payment gateway into different programming languages and frameworks. Our goal is to empower developers and businesses by providing easy-to-use tools to seamlessly accept payments.

## API Documentation

For detailed instructions on how to integrate with our API and utilize Chargily Pay™ in your projects, please refer to our [API Documentation](https://dev.chargily.com/pay-v2/introduction). 

## Developers Community

Join our developer community on Telegram to connect with fellow developers, ask questions, and stay updated on the latest news and developments related to Chargily Pay™ : [Telegram Community](https://chargi.link/PayTelegramCommunity)

## How to Contribute

We welcome contributions of all kinds, whether it's bug fixes, feature enhancements, documentation improvements, or new plugin/package developments. Here's how you can get started:

1. **Fork the Repository:** Click the "Fork" button in the top-right corner of this page to create your own copy of the repository.

2. **Clone the Repository:** Clone your forked repository to your local machine using the following command:

```bash
git clone https://github.com/Chargily/chargily-pay-javascript.git
```

3. **Make Changes:** Make your desired changes or additions to the codebase. Be sure to follow our coding standards and guidelines.

4. **Test Your Changes:** Test your changes thoroughly to ensure they work as expected.

5. **Submit a Pull Request:** Once you're satisfied with your changes, submit a pull request back to the main repository. Our team will review your contributions and provide feedback if needed.

## Get in Touch

Have questions or need assistance? Join our developer community on [Telegram](https://chargi.link/PayTelegramCommunity) and connect with fellow developers and our team.

We appreciate your interest in contributing to Chargily Pay™! Together, we can build something amazing.

Happy coding!

