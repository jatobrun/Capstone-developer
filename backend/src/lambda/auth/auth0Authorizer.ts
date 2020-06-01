import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = '...'
const cert = `-----BEGIN CERTIFICATE-----
MIIC/zCCAeegAwIBAgIJFRtj2MKp6vcmMA0GCSqGSIb3DQEBCwUAMB0xGzAZBgNV
BAMTEmphdG9icnVuLmF1dGgwLmNvbTAeFw0yMDA1MDkyMTU2MzJaFw0zNDAxMTYy
MTU2MzJaMB0xGzAZBgNVBAMTEmphdG9icnVuLmF1dGgwLmNvbTCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBAOuwqDbuEo5KKuTKdzQt4Hy1rgF8lCQ0rVgQ
MugmtpJ127+sYGD2vzOT8PaRsZWZyIkdRnLwLAtl47FjJU5fjq6EQyNXdg2vRqz9
0Wdbk51pE6m+tL9QdAGLpkjqpq+/U2iGOynYDi/NKx7r7lqDMKmwsJRhrI6bn0Il
Y5Wx5tJA9a8Vtoh2sEsv209oX/jazVyERYoGJME4x9NstELOyzoYJVBQpy7JAWxn
Xpr5kmuqqrGI9wZP6W1iwO8qGdOS94p87BFkB/hxR2zzfE91WJ0vFIVSZkrS9LDE
cGsZLbIn61fZO+4YGthU1NlCzsphlAOVTF4vAQDV8Ie6p7do04UCAwEAAaNCMEAw
DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUUzlCbbsL79zlqISb6d416q2g8oow
DgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQDigrDhWJXYb5WtJPgu
MMZQtKXqhZ9zWKTmnEWMKtyxBv5TN5OTgQ4SbmOlREV8z0LtrjW1DgxVE3vxD152
kiaHZmYqEqAr4P4AmDgkSuTKTw7j3Wha58p2Opt34MYsQ5OTz2vRvnj3Fu/90Pou
bM1w6WKQlX4DUOpfqStCcAzDlUoshq0CbAfMeNwdFFp8hrW1gMHDUX+eX7Jm0fPW
+L/GvSkp9A7Y9hmxsfiAXZAix8L4rUyp8HHL//wym1445aGIngejn1DYPaxZCCeh
1wlMTj/WhSbr+fnawGmE006aek7vZRFI/w3hNRw6tkEhOI4UnUuMft9S0vMzblA7
gv/V
-----END CERTIFICATE-----`
export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

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

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
