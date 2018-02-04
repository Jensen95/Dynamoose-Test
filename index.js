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

// Autorization for ZenseControl device routes
const deviceAuthentication = async (ctx, next) => {
  if (
    typeof ctx.headers.authorizationtoken === 'string' &&
    /^([0-9]|[a-f]){64}$/ig.test(ctx.headers.authorizationtoken)
  ) {
    const deviceToken = ctx.headers.authorizationtoken
    await Subscriber.findOne({
      where: {deviceToken},
      attributes: ['terminationDate']
    }).then(subscriber => {
      if (subscriber == null) {
        ctx.throw(401, 'Not found')
      }

      // Check if license still is valid
      if (moment(subscriber.terminationDate).isBefore(moment(), 'day')) {
        ctx.throw(402, 'Renew ZenseControl license')
      }
    })
      .catch(error => ctx.throw(403, error))
    await next()
  } else {
    return ctx.throw(412, 'Authorization header not present or has ambiguous content')
  }
}

// Autorization for ZenseControl management routes
const managementAuthentication = async (ctx, next) => {
  // TODO: Remember to change IPs to the correct ones
  if (
    ctx.ip === '::ffff:185.24.171.16' ||
    ctx.ip === '::1'
  ) {
    await next()
  } else {
    ctx.throw(407, 'Proxy Authentication Required')
  }
}

// Returns latest build number if there's a newer version for the service
router.get('/latest/:service', deviceAuthentication, async (ctx) => {
  ctx.throw(400, `Missing: zenseId, MAC or socType`)
  return ctx.body = `IP: ${ctx.ip} HOST:${ctx.host}`
})

// Returns build
router.get('/latest/:service', deviceAuthentication, async (ctx) => {

})

router.get('/', managementAuthentication, async (ctx) => {
  return Subscriber.all()
    .then(subcribers => {
      ctx.body = JSON.stringify(subcribers, null, 2)
    })
    .catch(error => ctx.throw(404, error))
})

// Adds a new device to the subscription table and returns the created device
router.post('/device', managementAuthentication, koaBody(), async (ctx) => {
  const formBody = ctx.request.body
  if (formBody.zenseId == null || formBody.zenseMac == null || formBody.socType == null) {
    return ctx.throw(400, `Missing: zenseId, MAC or socType`)
  } else {
    // TODO: Check if terminationDate is negative
    // TerminationDate sets default period on creation if not specified it's always in days forward
    const {zenseId = '', zenseMac = '', socType = '', terminationDate = 185} = formBody
    const activeDuration = moment.duration({'days': terminationDate})

    return Subscriber.create({
      zenseId,
      zenseMac,
      socType,
      terminationDate: moment().add(activeDuration).utc().format(),
      deviceToken: crypto.createHmac('sha256', zenseMac).update(zenseId.toString()).digest('hex')
    }).then(subscriber => {
      ctx.status = 201
      ctx.body = subscriber
    })
      .catch(error => ctx.throw(400, error))
  }
})

router.put('/device', managementAuthentication, koaBody(), async (ctx) => {
  // TODO: Add the option to change mac or extend termination date
  // ZenseID and a optional field is required
})

app.use(logger())
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT, () => console.log(`zensehub api service started on :${PORT}`))
