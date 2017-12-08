'use strict'

const dynamoose = require('dynamoose')

const SubscriberSchema = new dynamoose.Schema({
  zenseMac: {
    type: String,
    required: true,

    validate:
      (mac) => { return /^[A-Fa-f\d]{12}$/i.test(mac)}
  },
  // TODO: Maybe it should be a string
  zenseId: {
    type: Number,
    trim: true,
    hashKey: true,
    validate:
      (id) => { return id.toString().length > 3 },
  },
  deviceToken: {
    type: String,
    required: true
  },
  terminationDate: {
    type: Date,
    required: true
  }
})

module.exports = dynamoose.model('Subscriber', SubscriberSchema)
