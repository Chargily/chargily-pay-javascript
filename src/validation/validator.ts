import Joi from 'joi';

/**
 * Validates a payload against a Joi schema and throws a descriptive error if validation fails.
 * @param schema - The Joi schema to validate against
 * @param data - The data to validate
 * @param context - A descriptive name for the operation (e.g., "Create Customer")
 * @throws {Error} Throws a validation error with a clear message if validation fails
 */
export async function validatePayload<T>(
  schema: Joi.Schema,
  data: T,
  context: string
): Promise<void> {
  try {
    await schema.validateAsync(data, {
      abortEarly: false,
      stripUnknown: false,
    });
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      const messages = error.details
        .map((detail) => {
          const path = detail.path.join('.');
          return `${path}: ${detail.message}`;
        })
        .join('; ');

      throw new Error(
        `[${context}] Validation failed: ${messages}`
      );
    }
    throw error;
  }
}
