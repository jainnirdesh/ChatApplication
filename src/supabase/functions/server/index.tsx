import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Enable CORS and logging
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// User signup
app.post('/make-server-3088f3ea/auth/signup', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400)
    }

    // Check if username is already taken
    const existingUser = await kv.get(`user:username:${username.toLowerCase()}`)
    if (existingUser) {
      return c.json({ error: 'Username is already taken' }, 400)
    }

    // Create user with Supabase auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: `${username}@chat.local`, // Using fake email since we only need username
      password,
      user_metadata: { username },
      email_confirm: true // Auto-confirm since we don't have email server
    })

    if (error) {
      console.log('Supabase auth error:', error)
      return c.json({ error: 'Failed to create user account' }, 500)
    }

    const userId = data.user?.id
    if (!userId) {
      return c.json({ error: 'Failed to create user' }, 500)
    }

    // Store user data in KV store
    const userData = {
      id: userId,
      username,
      createdAt: new Date().toISOString()
    }

    await kv.set(`user:${userId}`, userData)
    await kv.set(`user:username:${username.toLowerCase()}`, userId)

    return c.json({ 
      success: true,
      user: userData
    })

  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// User signin
app.post('/make-server-3088f3ea/auth/signin', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400)
    }

    // Sign in with Supabase auth using fake email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@chat.local`,
      password
    })

    if (error) {
      console.log('Signin error:', error)
      return c.json({ error: 'Invalid username or password' }, 401)
    }

    const userId = data.user?.id
    if (!userId) {
      return c.json({ error: 'Failed to authenticate user' }, 500)
    }

    // Get user data from KV store
    const userData = await kv.get(`user:${userId}`)
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404)
    }

    return c.json({ 
      success: true,
      user: userData,
      accessToken: data.session.access_token
    })

  } catch (error) {
    console.log('Signin error:', error)
    return c.json({ error: 'Internal server error during signin' }, 500)
  }
})

// Get all rooms
app.get('/make-server-3088f3ea/rooms', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const rooms = await kv.getByPrefix('room:')
    const roomList = rooms.map(room => ({
      id: room.id,
      name: room.name,
      participantCount: room.participantCount || 0,
      createdAt: room.createdAt
    }))

    return c.json({ rooms: roomList })

  } catch (error) {
    console.log('Get rooms error:', error)
    return c.json({ error: 'Failed to fetch rooms' }, 500)
  }
})

// Create room
app.post('/make-server-3088f3ea/rooms', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { name } = await c.req.json()
    
    if (!name || !name.trim()) {
      return c.json({ error: 'Room name is required' }, 400)
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const roomData = {
      id: roomId,
      name: name.trim(),
      participantCount: 1,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    }

    await kv.set(`room:${roomId}`, roomData)

    return c.json({ 
      success: true,
      room: roomData
    })

  } catch (error) {
    console.log('Create room error:', error)
    return c.json({ error: 'Failed to create room' }, 500)
  }
})

// Get messages for a room
app.get('/make-server-3088f3ea/rooms/:roomId/messages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const roomId = c.req.param('roomId')
    const messages = await kv.getByPrefix(`message:${roomId}:`)
    
    // Sort messages by timestamp
    const sortedMessages = messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(msg => ({
        id: msg.id,
        roomId: msg.roomId,
        userId: msg.userId,
        username: msg.username,
        content: msg.content,
        timestamp: msg.timestamp
      }))

    return c.json({ messages: sortedMessages })

  } catch (error) {
    console.log('Get messages error:', error)
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// Send message
app.post('/make-server-3088f3ea/rooms/:roomId/messages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user?.id) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const roomId = c.req.param('roomId')
    const { content } = await c.req.json()
    
    if (!content || !content.trim()) {
      return c.json({ error: 'Message content is required' }, 400)
    }

    // Get user data to include username
    const userData = await kv.get(`user:${user.id}`)
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404)
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const messageData = {
      id: messageId,
      roomId,
      userId: user.id,
      username: userData.username,
      content: content.trim(),
      timestamp: new Date().toISOString()
    }

    await kv.set(`message:${roomId}:${messageId}`, messageData)

    return c.json({ 
      success: true,
      message: messageData
    })

  } catch (error) {
    console.log('Send message error:', error)
    return c.json({ error: 'Failed to send message' }, 500)
  }
})

// Initialize default rooms
app.get('/make-server-3088f3ea/init', async (c) => {
  try {
    const defaultRooms = [
      { name: 'General', id: 'general' },
      { name: 'Tech Talk', id: 'tech-talk' },
      { name: 'Random', id: 'random' },
      { name: 'Design', id: 'design' }
    ]

    for (const room of defaultRooms) {
      const existing = await kv.get(`room:${room.id}`)
      if (!existing) {
        const roomData = {
          id: room.id,
          name: room.name,
          participantCount: Math.floor(Math.random() * 20) + 1,
          createdBy: 'system',
          createdAt: new Date().toISOString()
        }
        await kv.set(`room:${room.id}`, roomData)
      }
    }

    return c.json({ success: true, message: 'Default rooms initialized' })

  } catch (error) {
    console.log('Init error:', error)
    return c.json({ error: 'Failed to initialize default rooms' }, 500)
  }
})

export default app

Deno.serve(app.fetch)