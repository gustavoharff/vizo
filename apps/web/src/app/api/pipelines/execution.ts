import { db } from '@vizo/drizzle'
import { comment, task } from '@vizo/drizzle/schema'
import { FacebookSDK } from '@vizo/facebook-sdk'
import { generateSasUrl, upload } from '@vizo/storage'
import axios from 'axios'
import { eq } from 'drizzle-orm'

interface ExectionOptions {
  pageId: string
  accessToken: string
  pipelineId: string
  commentsTaskId: string
  awsTaskId: string
  googleTaskId: string
  azureTaskId: string
}

export async function execution(options: ExectionOptions) {
  const {
    pageId,
    accessToken,
    pipelineId,
    commentsTaskId,
    awsTaskId,
    googleTaskId,
    azureTaskId,
  } = options

  await new Promise((resolve) => setTimeout(resolve, 1000))

  await db
    .update(task)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(task.id, commentsTaskId))

  const commentsTaskFileUrl = await generateSasUrl({
    name: `task-${commentsTaskId}`,
    contentType: 'application/json',
  })

  const { data: commentsTaskFile } =
    await axios.get<object[]>(commentsTaskFileUrl)

  try {
    const sdk = new FacebookSDK(accessToken)

    const posts = await sdk.posts().getPosts(pageId)

    commentsTaskFile.push({
      type: 'text',
      content: 'ℹ Found ' + posts.length + ' posts',
    })

    for (const post of posts) {
      commentsTaskFile.push({
        type: 'text',
        content: 'Fetching comments for post: ' + post.id,
      })

      await upload({
        blob: Buffer.from(JSON.stringify(commentsTaskFile)),
        contentType: 'application/json',
        length: JSON.stringify(commentsTaskFile).length,
        name: `task-${commentsTaskId}`,
      })

      const comments = await sdk.comments().getComments(post.id)

      commentsTaskFile.push({
        type: 'text',
        content: 'ℹ Found ' + comments.length + ' comments',
      })

      for (const c of comments) {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        await upload({
          blob: Buffer.from(JSON.stringify(commentsTaskFile)),
          contentType: 'application/json',
          length: JSON.stringify(commentsTaskFile).length,
          name: `task-${commentsTaskId}`,
        })

        await db.insert(comment).values({
          commentId: c.id,
          pageId,
          message: c.message,
          publishedAt: new Date(c.created_time),
          pipelineId,
        })

        commentsTaskFile.push({
          type: 'text',
          content: '✔ Saved comment: ' + c.id,
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    await db
      .update(task)
      .set({ status: 'completed', finishedAt: new Date() })
      .where(eq(task.id, commentsTaskId))
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data)

      commentsTaskFile.push({
        type: 'text',
        content: '✖ An error occurred while fetching posts',
      })

      await upload({
        blob: Buffer.from(JSON.stringify(commentsTaskFile)),
        contentType: 'application/json',
        length: JSON.stringify(commentsTaskFile).length,
        name: `task-${commentsTaskId}`,
      })

      await db
        .update(task)
        .set({ status: 'failed', finishedAt: new Date() })
        .where(eq(task.id, commentsTaskId))
    } else {
      console.error(error)
    }

    await db
      .update(task)
      .set({ status: 'failed', finishedAt: new Date() })
      .where(eq(task.id, commentsTaskId))

    await db
      .update(task)
      .set({ status: 'cancelled' })
      .where(eq(task.id, awsTaskId))

    await db
      .update(task)
      .set({ status: 'cancelled' })
      .where(eq(task.id, googleTaskId))

    await db
      .update(task)
      .set({ status: 'cancelled' })
      .where(eq(task.id, azureTaskId))

    return
  }

  await db
    .update(task)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(task.id, awsTaskId))

  const awsTaskFileUrl = await generateSasUrl({
    name: `task-${awsTaskId}`,
    contentType: 'application/json',
  })

  const { data: awsTaskFile } = await axios.get<object[]>(awsTaskFileUrl)

  await new Promise((resolve) => setTimeout(resolve, 1000))

  for (let i = 0; i <= 3; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const percentage = (i / 3) * 100

    awsTaskFile.push({ type: 'text', content: `Processing ${percentage}%...` })

    await upload({
      blob: Buffer.from(JSON.stringify(awsTaskFile)),
      contentType: 'application/json',
      length: JSON.stringify(awsTaskFile).length,
      name: `task-${awsTaskId}`,
    })
  }

  await db
    .update(task)
    .set({ status: 'completed', finishedAt: new Date() })
    .where(eq(task.id, awsTaskId))

  await db
    .update(task)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(task.id, googleTaskId))

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const googleTaskFileUrl = await generateSasUrl({
    name: `task-${googleTaskId}`,
    contentType: 'application/json',
  })

  const { data: googleTaskFile } = await axios.get<object[]>(googleTaskFileUrl)

  for (let i = 0; i <= 4; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const percentage = (i / 4) * 100

    googleTaskFile.push({
      type: 'text',
      content: `Processing ${percentage}%...`,
    })

    await upload({
      blob: Buffer.from(JSON.stringify(googleTaskFile)),
      contentType: 'application/json',
      length: JSON.stringify(googleTaskFile).length,
      name: `task-${googleTaskId}`,
    })
  }

  await db
    .update(task)
    .set({ status: 'completed', finishedAt: new Date() })
    .where(eq(task.id, googleTaskId))

  await db
    .update(task)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(task.id, azureTaskId))

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const azureTaskFileUrl = await generateSasUrl({
    name: `task-${azureTaskId}`,
    contentType: 'application/json',
  })

  const { data: azureTaskFile } = await axios.get<object[]>(azureTaskFileUrl)

  for (let i = 0; i <= 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const percentage = (i / 5) * 100

    azureTaskFile.push({
      type: 'text',
      content: `Processing ${percentage}%...`,
    })

    await upload({
      blob: Buffer.from(JSON.stringify(azureTaskFile)),
      contentType: 'application/json',
      length: JSON.stringify(azureTaskFile).length,
      name: `task-${azureTaskId}`,
    })
  }

  await db
    .update(task)
    .set({ status: 'completed', finishedAt: new Date() })
    .where(eq(task.id, azureTaskId))
}