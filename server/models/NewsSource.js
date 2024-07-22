import { Schema, model } from 'mongoose';

const newsSource = new Schema({
  id: { type: String, default: null },
  name: { type: String, required: true, unique: true }
});
newsSource.index({ name: 1 }, { unique: true });
const NewsSource = model('NewsSource', newsSource);

export default NewsSource;
