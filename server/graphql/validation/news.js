import Joi from '@hapi/joi';

const author = Joi.string().allow(null,'').max(20);
const title = Joi.string().allow(null,'').max(20);
const content = Joi.string().allow(null,'').max(30);
const description = Joi.string().allow(null,'').max(30);
const page = Joi.number().allow(null).min(1);
const limit = Joi.number().allow(null).min(1).max(50);
const startDate = Joi.date().required();
const endDate = Joi.date().required();


function getNewsValidation(data) {
  const schema = Joi.object({
    author,
    title,
    content,
    description,
    page,
    limit
  });
  return schema.validate(data);
}

function getNewsStatsValidation(data) {
  const schema = Joi.object({
    startDate,
    endDate
  });
  return schema.validate(data);
}

function newsSourceValidation(data){
  const schema = Joi.object({
    id: Joi.string().allow(null, ''),
    name: Joi.string().required()
  });
  return schema.validate(data);
}

function newsContentValidation(data){
  const schema = Joi.object({
    source: Joi.object(),
    author: Joi.string().allow(null, ''),
    title: Joi.string().required(),
    description: Joi.string().allow(null, ''),
    url: Joi.string().allow(null, ''),
    urlToImage: Joi.string().allow(null, ''),
    publishedAt: Joi.date().required(),
    content: Joi.string().required() });
  return schema.validate(data);
}

export { getNewsValidation, getNewsStatsValidation , newsSourceValidation,newsContentValidation};