import { Schema, model } from 'mongoose';

const newsSourceSchema = new Schema({
  id: { type: String, default: null },
  name: { type: String, required: true, unique: true }
});

const NewsSource = model('NewsSource', newsSourceSchema);

export default NewsSource;
