import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createPost, deletePost, getMyPosts, patchPost } from '../api/post-api'
import Auth from '../auth/Auth'
import { Post } from '../types/Post'

interface PostsProps {
  auth: Auth
  history: History
}

interface PostsState {
  Posts: Post[]
  newPostName: string
  newPostDescription: string
  loadingPosts: boolean
}

export class Po extends React.PureComponent<PostsProps, PostsState> {
  state: PostsState = {
    Posts: [],
    newPostName: '',
    newPostDescription: '',
    loadingPosts: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPostName: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value)
    this.setState({ newPostDescription: event.target.value })
  }

  onEditButtonClick = (PostId: string) => {
    this.props.history.push(`/Posts/${PostId}/edit`)
  }

  onPostCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    console.log('Creanding post')
    try {
      console.log(this.state.newPostDescription)
      const dueDate = this.calculateDueDate()
      const newPost = await createPost(this.props.auth.getIdToken(), {
        name: this.state.newPostName,
        dueDate,
        description: this.state.newPostDescription
      })
      this.setState({
        Posts: [...this.state.Posts, newPost],
        newPostName: '',
        newPostDescription: ''
      })
    } catch {
      alert('Post creation failed')
    }
  }

  onPostDelete = async (PostId: string) => {
    try {
      await deletePost(this.props.auth.getIdToken(), PostId)
      this.setState({
        Posts: this.state.Posts.filter(Post => Post.PostId != PostId)
      })
    } catch {
      alert('Post deletion failed')
    }
  }

  onPostCheck = async (pos: number) => {
    try {
      const Post = this.state.Posts[pos]
      await patchPost(this.props.auth.getIdToken(), Post.PostId, {
        name: Post.name,
        dueDate: Post.dueDate,
        done: !Post.done
      })
      this.setState({
        Posts: update(this.state.Posts, {
          [pos]: { done: { $set: !Post.done } }
        })
      })
    } catch {
      alert('Post deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const Posts = await getMyPosts(this.props.auth.getIdToken())
      this.setState({
        Posts,
        loadingPosts: false
      })
    } catch (e) {
      alert(`Failed to fetch Posts: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Create Posts</Header>

        {this.renderCreatePostTitleInput()}
        {this.renderCreatePostDescriptionInput()}
        {this.renderCreatePostButtonInput()}
      </div>
    )
  }

  renderCreatePostTitleInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            fluid
            actionPosition="left"
            placeholder="Title"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
      </Grid.Row>
      
    )
  }
  renderCreatePostDescriptionInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            fluid
            actionPosition="left"
            placeholder="Description"
            onChange={this.handleDescriptionChange}
          />
        </Grid.Column>
      </Grid.Row>
      
    )
  }
  renderCreatePostButtonInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Create',
              onClick: this.onPostCreate
            }}
            size = "mini"
            placeholder = 'Some comment?'
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
      
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
