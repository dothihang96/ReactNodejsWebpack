import gql from 'graphql-tag';

const newsData = `
  total
  news
`;

/**
 * Get news list 
 */
export const GET_NEWS = gql`
  query($input: GetNewsInput) {
    getNews(input: $input) {
      ${newsData}
    }
  }
`;
