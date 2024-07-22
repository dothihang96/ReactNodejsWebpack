const mongoose = require('mongoose');
const { Schema } = mongoose;

const newsContent = new mongoose.Schema({
  author: { type: String},
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String },
  urlToImage: { type: String },
  publishedAt: { type: Date, required: true },
  content: { type: String, required: true },
  sourceId: { type: Schema.Types.ObjectId, ref: 'NewsSource', required: true }
});
newsContent.index({ title: 1,description:1 }, { unique: true });

const NewsContent = mongoose.model('NewsContent', newsContent);

module.exports = NewsContent;
