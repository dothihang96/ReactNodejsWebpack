
import {getNewsValidation , getNewsStatsValidation } from '../validation/news';


const Query = {
  /**
   * Get news
   *
   * @param {string} search
   * @param {number} limit
   * @param {number} page
   */
  getNews: async (root, { input: { search, page = 1,limit = 10 } }, { NewsContent }) => {
    console.log('call resolver start');

    const { error } = getNewsValidation({ search });
    if (error) {
      throw error;
    }
    const news = await NewsContent.aggregate([
      { $match: { title: new RegExp(search, 'i') } }, 
      // { $sort: { publishedAt: sort } }, 
      { $skip: (page - 1) * limit }, 
      { $limit: parseInt(limit) }
    ]);

    const totalResult = await NewsContent.aggregate([
      { $match: { title: new RegExp(search, 'i') } }, 
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);
    
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    return {total, news}
  }
};

export default { Query };
