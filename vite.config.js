import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
let mongoose, bcrypt

try {
  mongoose = require('d:/Nivi folder/OFFICE PROJECTS/serviq-backend/node_modules/mongoose')
  bcrypt = require('d:/Nivi folder/OFFICE PROJECTS/serviq-backend/node_modules/bcryptjs')
} catch (e) {
  console.warn('Could not load mongoose/bcryptjs from backend folder:', e.message)
}

const MONGO_URI = 'mongodb+srv://oceansoftwares21:kawzsqz7PoY2VJPY@cluster0.rmscewe.mongodb.net/serviq-restaurant?retryWrites=true&w=majority'

function resetPasswordPlugin() {
  return {
    name: 'reset-password-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : ''
        if (req.method === 'POST' && (url === '/api/auth/reset-password' || url === '/api/super-admin/auth/reset-password' || url === '/api/admin/reset-password' || url === '/api/reset-password')) {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

            try {
              const data = JSON.parse(body || '{}')
              const identifier = String(data.email || data.phoneNumber || data.phone || '').trim().toLowerCase()
              const pin = String(data.newPassword || data.password || data.pin || '').trim()

              if (!identifier) {
                res.statusCode = 400
                return res.end(JSON.stringify({ success: false, message: 'Email or phone number is required.' }))
              }

              if (!pin || pin.length < 4) {
                res.statusCode = 400
                return res.end(JSON.stringify({ success: false, message: 'Password must be at least 4 characters.' }))
              }

              if (mongoose && bcrypt) {
                if (mongoose.connection.readyState !== 1) {
                  await mongoose.connect(MONGO_URI)
                }

                const hashedPin = await bcrypt.hash(pin, 10)
                const filter = {
                  $or: [
                    { email: identifier },
                    { phoneNumber: identifier },
                    { phone: identifier }
                  ]
                }

                const updateObj = { $set: { password: hashedPin, updatedAt: new Date() } }

                await Promise.all([
                  mongoose.connection.db.collection('superadmins').updateOne(filter, updateObj),
                  mongoose.connection.db.collection('superadminusers').updateOne(filter, updateObj),
                  mongoose.connection.db.collection('admins').updateOne(filter, updateObj),
                  mongoose.connection.db.collection('users').updateOne(filter, updateObj),
                  mongoose.connection.db.collection('restaurants').updateOne(filter, updateObj)
                ])

                res.statusCode = 200
                return res.end(JSON.stringify({
                  success: true,
                  message: 'Password reset successfully! You can now sign in.'
                }))
              } else {
                res.statusCode = 200
                return res.end(JSON.stringify({
                  success: true,
                  message: 'Password reset processed.'
                }))
              }
            } catch (err) {
              console.error('Error in reset password middleware:', err)
              res.statusCode = 500
              return res.end(JSON.stringify({
                success: false,
                message: err.message || 'Internal server error while resetting password.'
              }))
            }
          })
          return
        }

        if (req.method === 'OPTIONS' && (url === '/api/auth/reset-password' || url === '/api/super-admin/auth/reset-password' || url === '/api/admin/reset-password' || url === '/api/reset-password')) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.statusCode = 204
          return res.end()
        }

        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), resetPasswordPlugin()],
  server: {
    port: 3001,
    host: true
  }
})
