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

import { createPost, deletePost, getAllPosts, patchPost } from '../api/post-api'
import Auth from '../auth/Auth'
import { Post } from '../types/Post'

interface PostsProps {
  auth: Auth
  history: History
}

interface PostsState {
  Posts: Post[]
  newPostName: string
  loadingPosts: boolean
}

export class Posts extends React.PureComponent<PostsProps, PostsState> {
  state: PostsState = {
    Posts: [],
    newPostName: '',
    loadingPosts: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPostName: event.target.value })
  }

  onEditButtonClick = (PostId: string) => {
    this.props.history.push(`/Posts/${PostId}/edit`)
  }

  onPostCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newPost = await createPost(this.props.auth.getIdToken(), {
        name: this.state.newPostName,
        dueDate
      })
      this.setState({
        Posts: [...this.state.Posts, newPost],
        newPostName: ''
      })
    } catch {
      alert('Post creation failed')
    }
  }

  onPostDelete = async (PostId: string) => {
    try {
      await deletePost(this.props.auth.getIdToken(), PostId)
      this.setState({
        Posts: this.state.Posts.filter(Post => Post.postId != PostId)
      })
    } catch {
      alert('Post deletion failed')
    }
  }

  onPostCheck = async (pos: number) => {
    try {
      const Post = this.state.Posts[pos]
      await patchPost(this.props.auth.getIdToken(), Post.postId, {
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
      const Posts = await getAllPosts(this.props.auth.getIdToken())
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
        <Header as="h1">Posts</Header>

        {this.renderCreatePostInput()}

        {this.renderPosts()}
      </div>
    )
  }

  renderCreatePostInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onPostCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderPosts() {
    if (this.state.loadingPosts) {
      return this.renderLoading()
    }

    return this.renderPostsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Posts
        </Loader>
      </Grid.Row>
    )
  }

  renderPostsList() {
    return (
      <Grid padded>
        {this.state.Posts.map((Post, pos) => {
          return (
            <Grid.Row key={Post.postId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onPostCheck(pos)}
                  checked={Post.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {Post.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {Post.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(Post.postId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPostDelete(Post.postId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {Post.attachmentUrl && (
                <Image src={Post.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
