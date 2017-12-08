'use strict'

const AWS = require('aws-sdk');
AWS.config.update({region:'eu-central-1'});

const Koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')
const crypto = require('crypto')
const dynamoose = require('dynamoose')
const Subscriber = require('./models/subsciber')
const PORT = process.env.PORT || 8000

dynamoose.local('http://localhost:32775')


const Cat = dynamoose.model('Cat', {id: Number, name: String, type: String})
// Create a new cat object
const garfield = new Cat({id: 666, name: 'Garfield', lort: '23dw'})
// Save to DynamoDB
garfield.save()
Cat.get(666)
  .then(function (badCat) {
    console.log('Never trust a smiling cat. - ' + badCat.name)
  })
const zenseId = 25325
const zenseMac = 'aabbccddeeff'
const date = new Date()
const deviceToken = crypto.createHmac('sha256', zenseMac).update(zenseId.toString()).digest('hex')

const firstDevice = new Subscriber({
  zenseId,
  zenseMac,
  terminationDate: date.getDate(),
  deviceToken
})

firstDevice.save()

const app = new Koa()
const router = new Router()

router.get('/', async (ctx) => {
  try {
    const getFirst = await Subscriber.get(25325)
    ctx.body = getFirst
  } catch (err) {
    return ctx.throw(500, err)
  }

})

app.use(logger())
app.use(router.routes())

app.listen(PORT, () => console.log(`zensehub api service started on :${PORT}`))

