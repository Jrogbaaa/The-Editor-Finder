import algoliasearch from 'algoliasearch/lite';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;

// Initialize Algolia client
export const searchClient = algoliasearch(appId, searchKey);

// Index names
export const EDITORS_INDEX = 'editors';
export const SHOWS_INDEX = 'shows'; 