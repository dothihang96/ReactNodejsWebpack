import express from 'express';
import models from '../models';
import { makeExecutableSchema } from 'graphql-tools';
import { getNewsValidation, getNewsStatsValidation } from '../graphql/validation/news';
import checkAuthorization from '../operator/checkAuthorization';
import * as gqlBuilder from 'gql-query-builder';
import resolvers from '../graphql/resolvers';
import typeDefs from '../graphql/schema';
import gql from '../operator/gql';

const app = express.Router();

const [newsResolver] = resolvers;
const schema = makeExecutableSchema({ typeDefs, resolvers: newsResolver });

// 分頁、模糊搜尋、日期排序 API
app.post('/news', async (req, res) => {
  console.log('req: ',req.body);
  const operation = 'getNews';
  const query = gqlBuilder.query({
    operation,
    variables: {
      input: {
        value: { ...req.body },
        type: 'GetNewsInput',
        required: true
      }
    },
    fields: ['total','news']
  });
  const result = await gql(schema, operation, query);
  restResult(res, result);
});



//個新聞來源每日統計新聞量
app.get('/stats', async (req, res) => {
    try {
      const startDate = req.body.startDate; 
      const endDate = req.body.endDate; 
      const { error } = getNewsStatsValidation({ startDate, endDate });
      if (error) {
        throw error;
      }
      const stats = await models.NewsContent.aggregate([
        {
          $match: {
            publishedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          },
        },
        {
          $lookup: {
            from: 'newssources', 
            localField: 'sourceId',
            foreignField: '_id',
            as: 'source', 
          },
        },
        {
          $unwind: '$source', 
        },
        {
          $group: {
            _id: { sourceId: '$sourceId', date: { $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' } } },
            count: { $sum: 1 },
            sourceName: { $first: '$source.name' },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id.date',
            count: 1,
            sourceName: 1,
          },
        },
      ]);
  
      res.json(stats);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
app.use(checkAuthorization);

export default app;