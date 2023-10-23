import Axios from 'axios'
import jwt from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = process.env.AUTH_0_JWKS_URL

const { verify } = jwt

let cachedCertificate

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
    const token = getToken(authHeader)

    const cert = await getCertificate()

    logger.info(`Verifying token ${token}`)

    return verify(token, cert, { algorithms: ['RS256'] })
}

function getToken(authHeader) {
  if (!authHeader) {
    throw new Error('No authentication header')
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header')
  }

  const split = authHeader.split(' ')
  return split[1]
}

async function getCertificate(){
    if (cachedCertificate) {
        return cachedCertificate
    }

    logger.info(`Fetching certificate from ${jwksUrl}`)

    const response = await Axios.get(jwksUrl)
    const keys = response.data.keys

    if (!keys || !keys.length) {
        throw new Error('No JWKS keys found')
    }

    const signingKeys = keys.filter(
        key => key.use === 'sig'
            && key.kty === 'RSA'
            && key.alg === 'RS256'
            && key.n
            && key.e
            && key.kid
            && (key.x5c && key.x5c.length)
    )

    if (!signingKeys.length) {
        throw new Error('No JWKS signing keys found')
    }

    // XXX: Only handles single signing key
    const key = signingKeys[0]
    const pub = key.x5c[0]  // public key

    // Certificate found!
    cachedCertificate = certToPEM(pub)

    logger.info('Valid certificate found', cachedCertificate)

    return cachedCertificate
}

function certToPEM(cert) {
    cert = cert.match(/.{1,64}/g).join('\n')
    cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
    return cert
}
