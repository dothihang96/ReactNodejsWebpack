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
import swaggerDoc from './swaggerDoc';
import { title } from 'process';
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
cron.schedule('*/1 * * * *', async () => {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const newsEndPoint = `http://newsapi.org/v2/everything?q=Apple&from=${formattedDate}&sortBy=popularity&apiKey=6e02a74c35fc4f7bb0a2acd7b039db00`;
    axios.get(newsEndPoint)
    .then(async function(response) {
      const data = response.data.articles;
      for (const article of data) {
        // 存新聞來源資料
        const newsSrcs = await models.NewsSource.aggregate(
          [ { $match : { name : article.source.name } } ]
        );
        let newsSrc;
        if(newsSrcs.length < 1){
          newsSrc = new models.NewsSource({ id: article.source.id, name: article.source.name });
          newsSrc.save(); 
        }else{
          newsSrc = newsSrcs[0];
        }
        // 存新聞資料
        const newContents = await models.NewsContent.aggregate(
          [ { $match : { title : article.title } } ]
        );
        if(newContents.length < 1){
          const newContent = new models.NewsContent({
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.urlToImage,
            publishedAt: new Date(article.publishedAt),
            content: article.content,
            sourceId: newsSrc._id
          });
          newContent.save(); 
        }
      }
    })
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

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
