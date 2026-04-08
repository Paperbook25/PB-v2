import { createHmac } from 'crypto'
import { prisma } from '../config/db.js'
import { generateSocialPostImage } from './image-generation.service.js'

// Retrieve credentials from PlatformIntegration
async function getIntegration(provider: string) {
  try {
    const row = await (prisma as any).platformIntegration.findFirst({
      where: { provider, status: 'active' },
    })
    if (!row) return null
    const creds = typeof row.credentials === 'string' ? JSON.parse(row.credentials) : row.credentials
    return creds
  } catch {
    return null
  }
}

export async function postToLinkedIn(creds: any, text: string, blogUrl: string, imageBuffer?: Buffer): Promise<string | undefined> {
  const { accessToken, organizationUrn } = creds
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0',
  }

  // If image, upload it first
  let mediaAsset: string | undefined
  if (imageBuffer) {
    try {
      const regRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: organizationUrn,
            serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
          },
        }),
      })
      const regData = await regRes.json() as any
      const uploadUrl = regData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl
      const asset = regData.value?.asset
      if (uploadUrl && asset) {
        await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: imageBuffer })
        mediaAsset = asset
      }
    } catch {
      // Image upload failed; proceed without image
    }
  }

  const shareContent: any = {
    shareCommentary: { text },
    shareMediaCategory: mediaAsset ? 'IMAGE' : 'NONE',
  }
  if (mediaAsset) {
    shareContent.media = [{ status: 'READY', media: mediaAsset }]
  }

  const body = {
    author: organizationUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: { 'com.linkedin.ugc.ShareContent': shareContent },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  }

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`LinkedIn API error: ${await res.text()}`)
  const data = await res.json() as any
  return data.id
}

export async function postToFacebook(creds: any, text: string, linkUrl: string): Promise<string | undefined> {
  const { pageId, pageAccessToken } = creds
  const url = `https://graph.facebook.com/${pageId}/feed`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, link: linkUrl, access_token: pageAccessToken }),
  })
  if (!res.ok) throw new Error(`Facebook API error: ${await res.text()}`)
  const data = await res.json() as any
  return data.id
}

export async function postToTwitter(creds: any, text: string): Promise<string | undefined> {
  const { apiKey, apiSecret, accessToken, accessTokenSecret } = creds
  const tweetText = text.length > 280 ? text.slice(0, 277) + '…' : text

  const oauthHeader = buildOAuth1Header(
    'POST',
    'https://api.twitter.com/2/tweets',
    {},
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret,
  )

  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: { 'Authorization': oauthHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: tweetText }),
  })
  if (!res.ok) throw new Error(`Twitter API error: ${await res.text()}`)
  const data = await res.json() as any
  return data.data?.id
}

function buildOAuth1Header(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerKey: string,
  consumerSecret: string,
  token: string,
  tokenSecret: string,
): string {
  const nonce = Math.random().toString(36).substring(2)
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: token,
    oauth_version: '1.0',
  }
  const allParams = { ...params, ...oauthParams }
  const paramString = Object.keys(allParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
    .join('&')
  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`
  const signature = createHmac('sha1', signingKey).update(baseString).digest('base64')
  oauthParams['oauth_signature'] = signature

  return 'OAuth ' + Object.keys(oauthParams)
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ')
}

export async function postBlogToAllSocials(blogPostId: string): Promise<{ platform: string; success: boolean; postId?: string; error?: string }[]> {
  const post = await (prisma as any).platformBlogPost.findUnique({ where: { id: blogPostId } })
  if (!post) throw new Error('Blog post not found')

  const blogUrl = `https://paperbook.app/blog/${post.slug}`

  // Generate social post text with hashtags
  const hashtags = (post.keywords || []).slice(0, 5).map((k: string) => '#' + k.replace(/\s+/g, '')).join(' ')
  const socialText = `${post.title}\n\n${post.excerpt || ''}\n\nRead more: ${blogUrl}\n\n${hashtags}`

  // Generate cover image
  let imageBuffer: Buffer | undefined
  try {
    imageBuffer = await generateSocialPostImage('linkedin', post.title, post.excerpt || '')
  } catch {
    // Image generation failed; proceed without image
  }

  const results: { platform: string; success: boolean; postId?: string; error?: string }[] = []

  for (const platform of ['linkedin', 'facebook', 'twitter']) {
    const creds = await getIntegration(platform)
    if (!creds) continue

    try {
      let postId: string | undefined
      if (platform === 'linkedin') postId = await postToLinkedIn(creds, socialText, blogUrl, imageBuffer)
      else if (platform === 'facebook') postId = await postToFacebook(creds, socialText, blogUrl)
      else if (platform === 'twitter') postId = await postToTwitter(creds, `${post.title}\n\n${blogUrl}`)

      await (prisma as any).socialPostLog.create({
        data: { blogPostId, platform, postId, message: socialText, status: 'sent' },
      })
      results.push({ platform, success: true, postId })
    } catch (err: any) {
      await (prisma as any).socialPostLog.create({
        data: { blogPostId, platform, message: socialText, status: 'failed', error: err.message },
      })
      results.push({ platform, success: false, error: err.message })
    }
  }

  return results
}
