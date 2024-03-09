/**
 * Represents the standard response for a paginated list from the Chargily API.
 * @template T - The data type of the items in the list.
 */
export interface ListResponse<T> {
  /** Indicates if the operation was performed in live mode or test mode. */
  livemode: boolean;

  /** The current page number of the list. */
  current_page: number;

  /** An array of items of type T on the current page. */
  data: T[];

  /** The URL for the first page of the list. */
  first_page_url: string;

  /** The number indicating the last page of the list. */
  last_page: number;

  /** The URL for the last page of the list. */
  last_page_url: string;

  /** The URL for the next page of the list, or null if on the last page. */
  next_page_url: string | null;

  /** The base path URL for the paginated list endpoints. */
  path: string;

  /** The number of items to be displayed per page. */
  per_page: number;

  /** The URL for the previous page of the list, or null if on the first page. */
  prev_page_url: string | null;

  /** The total number of items available across all pages. */
  total: number;
}

/**
 * Represents the response received upon the deletion of an item via the Chargily API.
 */
export interface DeleteItemResponse {
  /** Indicates if the operation was performed in live mode or test mode. */
  livemode: boolean;

  /** The unique identifier of the item that was deleted. */
  id: string;

  /** A string representing the type of the object that was deleted. */
  entity: string;

  /** A boolean indicating whether the deletion was successful. */
  deleted: boolean;
}
