const mongoose = require('mongoose');
const { Schema } = mongoose;

const newsContentSchema = new mongoose.Schema({
  author: { type: String},
  title: { type: String, required: true, unique: true },
  description: { type: String },
  url: { type: String },
  urlToImage: { type: String },
  publishedAt: { type: Date, required: true },
  content: { type: String, required: true },
  sourceId: { type: Schema.Types.ObjectId, ref: 'NewsSource', required: true }
});

const NewsContent = mongoose.model('NewsContent', newsContentSchema);

module.exports = NewsContent;
