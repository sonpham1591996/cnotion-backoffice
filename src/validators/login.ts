import * as Joi from 'joi'

const loginSchema = Joi.object({
  address: Joi.string().min(8).required(),
})

export default loginSchema
