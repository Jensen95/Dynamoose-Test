'use strict'

const Koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')
const koaBody = require('koa-body')
const send = require('koa-send')
const crypto = require('crypto')
const path = require('path')
const fs = require('graceful-fs')
const moment = require('moment')
const semver = require('semver')

const Subscriber = require('./models').Subscriber
const Service = require('./models').Service

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
      attributes: [
        'zenseId',
        'terminationDate'
      ]
    }).then(subscriber => {
      if (subscriber == null) {
        return ctx.throw(401, 'Not found')
      }
      ctx.zenseId = subscriber.zenseId
      // Check if license still is valid
      if (moment(subscriber.terminationDate).isBefore(moment(), 'day')) {
        return ctx.throw(402, 'Renew ZenseControl license')
      }
    })
      .catch(error => ctx.throw(403, error))
    await next()
  } else {
    return ctx.throw(412, 'Authorization header isn\'t present or has ambiguous content')
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
    return ctx.throw(407, 'Proxy Authentication Required')
  }
}

// Returns latest build number if there's a newer version for the service if not returns the same version as in query
router.get('/latest/:service', deviceAuthentication, async (ctx) => {
  try {
    JSON.parse(ctx.query.query)
  } catch (error) {
    return ctx.throw(400, 'Query not valid JSON')
  }
  const query = JSON.parse(ctx.query.query)

  if (ctx.query.query == null) {
    return ctx.throw(400, 'Current version needed in query')
  } else if (semver.valid(query.version) == null) {
    return ctx.throw(400, 'Version number is not valid  semantic versioning 2.0.0, See https://semver.org/')
  }

  return Service.findOne({
    order: [
      ['createdAt', 'DESC']
    ],
    attributes: [
      'version',
      'buildName'
    ]
  })
    .then(service => {
      if (semver.gt(service.version, query.version)) {
        ctx.body = JSON.stringify(service.buildName, null, 2)
      } else {
        ctx.status = 304
      }
    })
})

// Returns requested build, returns forbidden if file doesn't exists
router.get('/latest/:service/:build', deviceAuthentication, async (ctx) => {
  const buildsRootPath = path.join(__dirname, '/builds')
  const requestedServiceBuildPath = path.join(ctx.params.service, `${ctx.params.build}.zip`)

  if (fs.existsSync(path.resolve(buildsRootPath, requestedServiceBuildPath))) {
    await send(ctx, requestedServiceBuildPath, {root: buildsRootPath})
  } else {
    return ctx.throw(403)
  }
})

// Adds a new device to the subscription table and returns the created device
router.post('/device', managementAuthentication, koaBody(), async (ctx) => {
  const formBody = ctx.request.body
  if (formBody.zenseId == null || formBody.zenseMac == null || formBody.socType == null) {
    return ctx.throw(400, 'zenseId, mac and socType is required')
  }
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
})

router.put('/device', managementAuthentication, async (ctx) => {
  // ZenseID and a optional field is required
  try {
    JSON.parse(ctx.query.query)
  } catch (error) {
    return ctx.throw(400, 'Query not valid JSON')
  }
  const query = JSON.parse(ctx.query.query)
  const {zenseId = null, zenseMac = null, socType = null, terminationDate = 0} = query
  if (zenseId == null || (zenseMac == null && socType == null && terminationDate === 0)) {
    return ctx.throw(400, 'zenseId and [zenseMac || socType || terminationDate] value is required')
  }

  if (!/^([A-F]|\d){12}$/gi.test(zenseMac)) {
    return ctx.throw(400, 'Invalid MAC')
  }

  return Subscriber.findById(zenseId)
    .then(subscriber => {
      if (zenseMac != null) {
        subscriber.zenseMac = zenseMac
      }

      if (socType != null) {
        subscriber.socType = socType
      }

      if (terminationDate !== 0) {
        const durationExtion = moment.duration({'days': terminationDate})
        const lastActiveDate = moment(subscriber.terminationDate).add(durationExtion)
        subscriber.terminationDate = lastActiveDate.utc().format()
      }

      return subscriber.save().then(() => {
        ctx.status = 204
      })
    })
    .catch(error => ctx.throw(400, error))
})

router.get('/subscribers', managementAuthentication, async (ctx) => {
  return Subscriber.all()
    .then(subcribers => {
      ctx.body = JSON.stringify(subcribers, null, 2)
    })
    .catch(error => ctx.throw(404, error))
})

router.post('/build', managementAuthentication, koaBody(), async (ctx) => {
  // URL encoded
  const formBody = ctx.request.body
  if (formBody.serviceName == null || formBody.version == null || formBody.buildName == null) {
    return ctx.throw(400, 'serviceName, version and build is required')
  }

  const {serviceName = '', version = '', buildName = ''} = formBody

  return Service.create({
    serviceName,
    version,
    buildName
  }).then(service => {
    ctx.status = 201
    ctx.body = service
  })
    .catch(error => ctx.throw(400, error))
})

app.use(logger())
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT, () => console.log(`zensehub api service started on :${PORT}`))
