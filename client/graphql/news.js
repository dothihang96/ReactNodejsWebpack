import gql from 'graphql-tag';

const newsPayload = `
    _id
    author
    title
    description
    url
    urlToImage
    publishedAt
    content
    sourceId
`;

/**
 * Get news list 
 */
export const GET_NEWS = gql`
  query($input: GetNewsInput) {
    getNews(input: $input) {
      total
      news {
        ${newsPayload}
      }
    }
  }
`;
