import 'source-map-support/register'
//import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdatePostRequest } from '../../requests/UpdatePostRequest'
import { parseUserId } from '../../auth/utils'
import { updatePost } from '../../businessLogic/posts'
import { createLogger } from '../../utils/logger'


const logger = createLogger('updatePost')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const PostId = event.pathParameters.PostId
  const PostInput: UpdatePostRequest = JSON.parse(event.body)




  const authorization = event.headers.Authorization
  const jwtToken = authorization.split(' ')[1]
  const userId = parseUserId(jwtToken)
  const item = await updatePost(userId, PostId, PostInput)
  console.log('updatedResult', item)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(item)
  }
}