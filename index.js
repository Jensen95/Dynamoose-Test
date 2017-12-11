'use strict'

const Koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')
const koaBody = require('koa-body')
const crypto = require('crypto')
const Subscriber = require('./models').Subscriber

const PORT = process.env.PORT || 8000

const date = new Date()

const app = new Koa()
const router = new Router()

router.get('/', async (ctx) => {
  return Subscriber.all()
    .then(subcribers => {
      ctx.body = subcribers
    })
    .catch(error => ctx.throw(404, error))
})

router.post('/device', koaBody(), async (ctx) => {
  // TODO: Add validator on body have zenseId and valid mac
  const {zenseId, zenseMac, terminationDate = 30} = ctx.request.body
  console.log(ctx.request.body.zenseId)
  return Subscriber.create({
    zenseId,
    zenseMac,
    terminationDate: terminationDate,
    deviceToken: crypto.createHmac('sha256', zenseMac).update(zenseId.toString()).digest('hex')
  }).then(subscriber => {
    ctx.status = 201
    ctx.body = subscriber
  })
    .catch(error => ctx.throw(404, error))
})

app.use(logger('dev'))
app.use(router.routes())

app.listen(PORT, () => console.log(`zensehub api service started on :${PORT}`))
