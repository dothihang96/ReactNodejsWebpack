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
app.get('/get', async (req, res) => {
  const operation = 'getNews';
  const query = gqlBuilder.query({
    operation,
    variables: {
      input: {
        value: { ...req.query },
        type: 'GetNewsInput',
        required: true
      }
    },
    fields: ['total','news']
  });
  const result = await gql(schema, operation, query);
  restResult(res, result);
});

// // 分頁、模糊搜尋、日期排序 API
// app.get('/get', async (req, res) => {
//     const { page = 1, limit = 10, search = '', sort = 1 } = req.query;
//     const { error } = getNewsValidation({ search, sort });
//     if (error) {
//       throw error;
//     }
//     try {
//       const news = await models.NewsContent.aggregate([
//         { $match: { title: new RegExp(search, 'i') } }, 
//         { $sort: { publishedAt: sort } }, 
//         { $skip: (page - 1) * limit }, 
//         { $limit: parseInt(limit) }
//       ]);
  
//       const totalResult = await models.NewsContent.aggregate([
//         { $match: { title: new RegExp(search, 'i') } }, 
//         { $group: { _id: null, total: { $sum: 1 } } }
//       ]);
      
//       const total = totalResult.length > 0 ? totalResult[0].total : 0;
  
//       res.json({
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         news
//       });
//     } catch (err) {
//       res.status(400).json({ error: err.message });
//     }
//   });


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