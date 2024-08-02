
import {getNewsValidation , getNewsStatsValidation } from '../validation/news';
import _, { first } from 'lodash';


const Query = {
  /**
   * Get news
   *
   * @param {number} limit
   * @param {number} page
   */
  getNews: async (root, { input }, { NewsContent }) => {
    const { error } = getNewsValidation(input);
    if (error) {
      throw error;
    }
    const {
      author, content, title, description,
      page = 1, limit = 10
    } = input;

    const query = {};
      if (!_.isNil(author)) { // author有輸入時，模糊查詢
        Object.assign(query, { author: { $regex: author , $options: 'i'} });
      }
      if (!_.isNil(content)) { // content有輸入時，模糊查詢
        Object.assign(query, { content: { $regex: content ,$options: 'i'} });
      }
      if (!_.isNil(title)) { // title有輸入時，模糊查詢
        Object.assign(query, { title: { $regex: title ,$options: 'i'} });
      }
      if (!_.isNil(description)) { // description有輸入時，模糊查詢
        Object.assign(query, { description: { $regex: description ,$options: 'i'} });
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
