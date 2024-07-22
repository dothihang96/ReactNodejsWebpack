import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import errorHandler from 'errorhandler';
import express from 'express';
import logger from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import models from './models';

import resolvers from './graphql/resolvers';
import schema from './graphql/schema';
import createApolloServer from './graphql/apollo-server';
import api from './api/index';
import _ from 'lodash';
import { newsSourceValidation, newsContentValidation } from './graphql/validation/news';

import swaggerDoc from './swaggerDoc';
const cron = require('node-cron');
const axios = require('axios');

const app = express();
const PORT = process.env.NODE_ENV !== 'development' ? 3000 : 8081;
// Create a Apollo Server
async function startApolloServer() {
  const server = createApolloServer(schema, resolvers, models);
  await server.start(); // Await the server start
  server.applyMiddleware({ app, path: '/graphql' });
  console.log(
    `Apollo Server ready at http://localhost:3000${server.graphqlPath}`
  );
}

await startApolloServer();
mongoose
  .connect(process.env.MONGO_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log('Connected to Database'))
  .catch((err) => console.error('[ERROR]DB: ', err));


// 使用 node-cron 設置每30分鐘調用一次API
cron.schedule('*/30 * * * *', async () => {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const newsEndPoint = `http://newsapi.org/v2/everything?q=Apple&from=${formattedDate}&sortBy=popularity&apiKey=6e02a74c35fc4f7bb0a2acd7b039db00`;
    axios.get(newsEndPoint)
    .then(async function(response) {
      const data = response.data.articles;
      console.time('insert article');
      // 取出新聞來源，排除重複，新增、更新來源
      const newsSources = data.map(article => article.source);
      const uniqueSources = _.uniqBy(newsSources,'name');
      await handleNewsSourceData(uniqueSources);
      //存/更新新聞內容資料
      await handleNewsContentData(data);
      console.timeEnd('insert article');
    })
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});
/**
*@param {Object[]} data 欲新增的資料項
*/
async function handleNewsSourceData(data){
    //檢查 source 格式
    data.forEach(src => {
      const { error } = newsSourceValidation(src);
      if (error) {
        throw error;
      }
    });
    const existingSources = await models.NewsSource.find({ name: { $in: data.map(source => source.name) } });
    const nonExistingSources = data.filter(source => !existingSources.some(existingSource => existingSource.name === source.name));
    const updateSrcData = _.map(existingSources,({_id,id,name})=>{
      const $set = { id: id, name: name};
      return {
        query: {_id},
        update: {$set}
      }
    });
    await bulkUpdate(models.NewsSource, updateSrcData);
    const newNewsSources = nonExistingSources.map(src=>({
        id: src.id,
        name: src.name
    }));
    await bulkInsert(models.NewsSource,newNewsSources);
} 

/**
*@param {Object[]} data 欲新增的資料項
*/
async function handleNewsContentData(data){
    const existingContents = await models.NewsContent.find({ 
      $and: [
        { title: { $in: data.map(content => content.title) } },
        { description: { $in: data.map(content => content.description) } }
      ]
    });
    const nonExistingContent = data.filter(content => !existingContents.some(existingContent => existingContent.title === content.title
      && existingContent.description === content.description
    ));
    //檢查 content 格式
    nonExistingContent.forEach(src => {
      const { error } = newsContentValidation(src);
      if (error) {
        throw error;
      }
    });
    const updateContentData = _.map(existingContents,($set)=>{
      const {_id} = $set;
      return {
        query: {_id},
        update: {$set}
      }
    });
    await bulkUpdate(models.NewsContent, updateContentData);
    const newsContents = await Promise.all(nonExistingContent.map(async article => {
      return {
        author: article.author,
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: new Date(article.publishedAt),
        content: article.content,
        sourceId: (await models.NewsSource.findOne({ name: article.source.name }))._id
      };
    }));
    await bulkInsert(models.NewsContent,newsContents);
}

/**
* 批次新增資料
*
* @param {Object} model 欲新增資料的collection名稱
* @param {Object[]} data 欲新增的資料項
* @return result 執行結果
*/
async function bulkInsert(model, data) {
  let result;
  if (!_.isEmpty(data)) {
    const bulk = await model.collection.initializeUnorderedBulkOp();
    _.map(data, item => bulk.insert(item));
    try {
      result = await bulk.execute();
    } catch (error) {
      console.error('[ERROR]bulkInsert: ', error);
      result = error;
    }
  } else {
    result = new Error('No data.');
  }
  return result;
}


/**
* 批次新增資料
*
* @param {string} model 欲新增資料的collection名稱
* @param {Object[]} data 欲查詢的資料
* @param {Object} data.query 欲更新的查詢的範圍
* @param {Object} data.update 欲更新的資料
* @return result 執行結果
*/
async function bulkUpdate(model, data) {
  let result;
  if (!_.isEmpty(data)) {
    const bulk = await model.collection.initializeUnorderedBulkOp();
    _.map(data, ({ query, update }) => bulk.find(query).update(update));
    try {
      result = await bulk.execute();
    } catch (error) {
      console.error('[ERROR]bulkUpdate: ', error);
      result = error;
    }
  } else {
    result = new Error('No data.');
  }
  return result;
}

swaggerDoc(app);

app.use(
  bodyParser.json({
    limit: '10mb',
  })
);
app.use(
  bodyParser.urlencoded({
    limit: '10mb',
    extended: true,
  })
);

app.use(express.static('dist'));
app.use(logger('dev'));
app.use(cookieParser());
app.use('/api', api);

if (process.env.NODE_ENV !== 'development') {
  app.use(compression());
  app.use(express.static('public'));
  app.get('*', (req, res) => {
    const filePath = '../public/index.html';
    const index = path.resolve(filePath);
    res.sendFile(index);
  });
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found!');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(errorHandler());
}
app.listen(PORT, () => console.log(`🚀 API ready at ${PORT}`));