
import {getNewsValidation , getNewsStatsValidation } from '../validation/news';
import _ from 'lodash';


const Query = {
  /**
   * Get news
   *
   * @param {number} limit
   * @param {number} page
   */
  getNews: async (root, { input }, { NewsContent }) => {
    // const { error } = getNewsValidation({ search });
    // if (error) {
    //   throw error;
    // }
    const {
      author, content, title, desciption,
      page, limit
    } = input;

    const query = {};
      if (!_.isNil(author)) { // author有輸入時，模糊查詢
        Object.assign(query, { author: { $regex: author } });
      }
      if (!_.isNil(content)) { // content有輸入時，模糊查詢
        Object.assign(query, { content: { $regex: content } });
      }
      if (!_.isNil(title)) { // title有輸入時，模糊查詢
        Object.assign(query, { title: { $regex: title } });
      }
      if (!_.isNil(desciption)) { // desciption有輸入時，模糊查詢
        Object.assign(query, { desciption: { $regex: desciption } });
      }
      
    const [news, total] = await Promise.all([
      NewsContent
        .find(query)
        .skip((page - 1)*limit)
        .limit(_.toInteger(limit))
        .lean()
        .exec(),
      NewsContent.countDocuments(query)
    ]);
    return {total, news}
  }
};

export default { Query };
