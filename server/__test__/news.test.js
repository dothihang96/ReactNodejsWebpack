import newsResolver  from '../graphql/resolvers/news';
import Model from '../models';
import mongoose from 'mongoose';

describe('getNews', () => {

  let client;
  const MONGO_URL = 'mongodb://127.0.0.1:27017';
  beforeAll(async () => {
    // SETUP
    client = await mongoose.connect(MONGO_URL, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  });

  afterAll(async () => {
    // TEARDOWN
    await client.connection.close();
  });
  describe('getNews-validation',()=>{
    //input validation 
    it.each([
      ['author 型態錯誤', {
        code: 123, // 錯誤的參數內容
        errorMessage: '"author" must be a string'
      }],
      ['title 型態錯誤', {
        code: 123, // 錯誤的參數內容
        errorMessage: '"title" must be a string'
      }],
      ['description 型態錯誤', {
        code: 123, // 錯誤的參數內容
        errorMessage: '"description" must be a string'
      }],
      ['content 型態錯誤', {
        code: 123, // 錯誤的參數內容
        errorMessage: '"content" must be a string'
      }],
      ['page 型態錯誤', {
        code: 'string',
        errorMessage: '"page" must be a number'
      }],
      ['limit 型態錯誤', {
        code: 'string',
        errorMessage: '"limit" must be a number'
      }],
    ])('validation 異常測試 - %s ', async (desc, testParameter) => {
      const {
        author, title, description , content,page, limit,
        errorMessage = 'empty'
      } = testParameter;
      const handleGetNewsDraft = async () => {
        const inputObj = {
          input: { }
        };

        author && Object.assign(inputObj.input, { author });
        title && Object.assign(inputObj.input, { title });
        description && Object.assign(inputObj.input, { description });
        content && Object.assign(inputObj.input, { content });
        page && Object.assign(inputObj.input, { page });
        limit && Object.assign(inputObj.input, { limit });
        
        const {NewsContent} = Model;
        await newsResolver.Query.getNews(
          null,
          inputObj,
          {NewsContent}
        );
      };
      expect(handleGetNewsDraft).rejects.toThrow(errorMessage);
    });
  })

  describe('getNews-query condition',()=>{
    it('default get first 10 news from all', async () => {
      const input = {}
      const {NewsContent} = Model;
      const result = await newsResolver.Query.getNews(
        null,
        {input },
        {NewsContent}
      );
      expect(result.news.length).toEqual(10);
    });

    it('title search with Trump', async () => {
      const input = {title: "Trump"}
      const {NewsContent} = Model;
      const result = await newsResolver.Query.getNews(
        null,
        {input },
        {NewsContent}
      );
      const news = result.news;
      expect(news[0].title).toMatch(/trump/i);
    });

    it('title search with trump case insensitivity', async () => {
      const input = {title: "trump"}
      const {NewsContent} = Model;
      const result = await newsResolver.Query.getNews(
        null,
        {input },
        {NewsContent}
      );
      const news = result.news;
      expect(news[0].title).toMatch(/trump/i);
    });

    it('title search with string empty,should return first 10', async () => {
      const input = {title: ""}
      const {NewsContent} = Model;
      const result = await newsResolver.Query.getNews(
        null,
        {input },
        {NewsContent}
      );
      console.log('result: ', result);
      const news = result.news;
      expect(news.length).toEqual(10);
    });

    it('author search with NPR', async () => {
      const input = {author: "NPR"}
      const {NewsContent} = Model;
      const result = await newsResolver.Query.getNews(
        null,
        {input },
        {NewsContent}
      );
      const news = result.news;
      expect(news[0].author).toMatch(/NPR/i);
    });

    it('content search with Donald Trump', async () => {
      const input = {content: "Donald Trump"}
      const {NewsContent} = Model;
      const result = await newsResolver.Query.getNews(
        null,
        {input },
        {NewsContent}
      );
      const news = result.news;
      expect(news[0].content).toMatch(/Donald Trump/i);
    });

    it('description search with Saturday', async () => {
      const input = {description: "Saturday"}
      const {NewsContent} = Model;
      const result = await newsResolver.Query.getNews(
        null,
        {input },
        {NewsContent}
      );
      const news = result.news;
      expect(news[0].description).toMatch(/Saturday/i);
    });

    it('mix title and author search', async () => {
      const input = {author: "NPR" , title: "Trump"}
      const {NewsContent} = Model;
      const result = await newsResolver.Query.getNews(
        null,
        {input },
        {NewsContent}
      );
      const news = result.news;
      expect(news[0].author).toMatch(/NPR/i);
      expect(news[0].title).toMatch(/Trump/i);
    });

    it('mix all fields search', async () => {
      const input = {author: "NPR" , title: "Trump" , description: "Saturday", content:"Donald Trump",page:1,limit:30 }
      const {NewsContent} = Model;
      const result = await newsResolver.Query.getNews(
        null,
        {input },
        {NewsContent}
      );
      const news = result.news;
      expect(news[0].author).toMatch(/NPR/i);
      expect(news[0].title).toMatch(/Trump/i);
      expect(news[0].description).toMatch(/Saturday/i);
      expect(news[0].content).toMatch(/Donald Trump/i);
    });

    it('mix all fields search, result no data because of page 2', async () => {
      const input = {author: "NPR" , title: "Trump" , description: "Saturday", content:"Donald Trump",page:2,limit:30 }
      const {NewsContent} = Model;
      const result = await newsResolver.Query.getNews(
        null,
        {input },
        {NewsContent}
      );
      const news = result.news;
      expect(news.length).toEqual(0);
    });
  })
    
  });
