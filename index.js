'use strict'

const Koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')
const koaBody = require('koa-body')
const crypto = require('crypto')
const moment = require('moment')
const Subscriber = require('./models').Subscriber

const PORT = process.env.PORT || 8000

const app = new Koa()
const router = new Router()

router.get('/', async (ctx) => {
  return Subscriber.all()
    .then(subcribers => {
      ctx.body = JSON.stringify(subcribers, null, 2)
    })
    .catch(error => ctx.throw(404, error))
})

router.get('/latest', async (ctx) =>{

})

router.get('/auth', async (ctx) => {
  // Length of sha256 is 64
  const deviceToken = ctx.query.deviceToken
  return Subscriber.find({where: {deviceToken}})
    .then(subscriber => {
      // If not found return nothing
      // TODO: Add terminationDate check
      ctx.body = subscriber
    })
    .catch(error => ctx.throw(403, error))
})

router.post('/device', koaBody(), async (ctx) => {
  const formBody = ctx.request.body
  if (formBody.zenseId == null || formBody.zenseMac == null) {
    return ctx.throw(400, `Missing: zenseId or MAC`)
  }
  // TODO: Add moment ISO + termationDate
  const {zenseId = '', zenseMac = '', terminationDate = 185} = formBody
  return Subscriber.create({
    zenseId,
    zenseMac,
    terminationDate: terminationDate,
    deviceToken: crypto.createHmac('sha256', zenseMac).update(zenseId.toString()).digest('hex')
  }).then(subscriber => {
    ctx.status = 201
    ctx.body = subscriber
  })
    .catch(error => ctx.throw(400, error))
})

app.use(logger())
app.use(router.routes())

app.listen(PORT, () => console.log(`zensehub api service started on :${PORT}`))
