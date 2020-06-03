import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { PostItem } from '../models/PostItem'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class PostsAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly PostsTable = process.env.POSTS_TABLE
  ) {}

  async getMyPosts(userId: string): Promise<PostItem[]> {
    console.log('Getting My Posts for user:', userId)

    const result = await this.docClient
      .query({
        TableName: this.PostsTable,
        KeyConditionExpression: '#userId = :userId',
        ExpressionAttributeNames: {
          '#userId': 'userId'
        },
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    console.log('getMyPosts result:', items)
    return items as PostItem[]
  }
  async getAllPosts(): Promise<PostItem[]> {
    console.log('Getting all Posts:')

    const result = await this.docClient
      .scan({
        TableName: this.PostsTable
      })
      .promise()

    const items = result.Items
    console.log('get All Posts result:', items)
    return items as PostItem[]
  }

  async CreatePost(Post): Promise<PostItem> {
    console.log('creating Post:', Post)

    await this.docClient
      .put({
        TableName: this.PostsTable,
        Item: Post
      })
      .promise()

    return Post
  }

  async deletePost(PostId: string, userId: string): Promise<string> {
    console.log('Deleting Post:', PostId)

    await this.docClient
      .delete({
        TableName: this.PostsTable,
        Key: {
          PostId,
          userId
        }
      })
      .promise()

    console.log('Post deleted. PostId:', PostId)
    return ''
  }

  async updatePost(
    userId: string,
    PostId: string,
    updatedPost
  ): Promise<string> {
    console.log('updating Post:', PostId, updatedPost)

    await this.docClient
      .update({
        TableName: this.PostsTable,
        Key: {
          PostId,
          userId
        },
        UpdateExpression: 'set #name = :name, dueDate = :duedate, done = :done',
        ExpressionAttributeValues: {
          ':name': updatedPost.name,
          ':duedate': updatedPost.dueDate,
          ':done': updatedPost.done
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        }
      })
      .promise()

    console.log('Post updated:', updatedPost)

    return updatedPost
  }

  async generateUploadUrl(PostId: string): Promise<string> {
    console.log('generating Post', PostId)

    const url = s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: PostId,
      Expires: urlExpiration
    })

    console.log('generated upload url:', url)
    return url
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:3000'
    })
  }

  return new AWS.DynamoDB.DocumentClient()
}