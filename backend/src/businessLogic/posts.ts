import * as uuid from 'uuid'

import { PostsAccess } from '../dataLayer/PostsAccess'
import { CreatePostRequest } from '../requests/CreatePostRequest'
import { PostItem } from '../models/PostItem'

const PostAccess = new PostsAccess()
const bucketName = process.env.S3_BUCKET

// createPost
export async function createPost(newPost: CreatePostRequest, userId: string) {
  const PostId = uuid.v4()
  const item = {
    userId,
    PostId,
    createdAt: new Date().toISOString(),
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${PostId}`,
    ...newPost
  }

  console.log('New Post:', userId, item)
  return await PostAccess.CreatePost(item)
}

// getAllPosts
export async function getAllPosts(userId: string): Promise<PostItem[]> {
  return await PostAccess.getAllPosts(userId)
}

// deletePost
export async function deletePost(
  PostId: string,
  userId: string
): Promise<string> {
  return await PostAccess.deletePost(PostId, userId)
}

// updatePost
export async function updatePost(
  userId: string,
  PostId: string,
  updatedPost
): Promise<string> {
  return await PostAccess.updatePost(userId, PostId, updatedPost)
}

// generateUrl
export async function generateUploadUrl(PostId: string): Promise<string> {
  return await PostAccess.generateUploadUrl(PostId)
}