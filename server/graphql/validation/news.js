import Joi from '@hapi/joi';

const search = Joi.string()
  .min(50);
const sort = Joi.number()
  .allow(1,-1);
const startDate = Joi.date().required();
const endDate = Joi.date().required();


function getNewsValidation(data) {
  const schema = Joi.object({
    search,
    sort
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