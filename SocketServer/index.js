import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import http from "http"
import cors from "cors"
import { Server } from "socket.io"
import User from "./models/user.model.js"

dotenv.config()

const port = process.env.PORT || 5000
const mongodbUrl = process.env.MONGODB_URL

const connectDb = async () => {
  try {
    await mongoose.connect(mongodbUrl, { dbName: "nexride" })
    console.log("db connected (nexride)")
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

const app = express()


app.use(cors({
  origin: process.env.NEXT_BASE_URL,
  credentials: true
}))

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
})

const resolveUserId = (payload) => {
  if (!payload) return null
  if (typeof payload === "string") return payload
  if (typeof payload === "object" && payload.userId) return payload.userId
  return null
}

io.on("connection", (socket) => {
  console.log("user connected", socket.id)

  socket.on("identity", async (payload) => {
    try {
      const userId = resolveUserId(payload)

      if (!userId || !mongoose.isValidObjectId(userId)) {
        return
      }

      // store on socket
      socket.userId = userId

      await User.findByIdAndUpdate(userId, {
        $set: {
          socketId: socket.id,
          isOnline: true,
        },
      })

      console.log("identity set", userId)
    } catch (error) {
      console.error("identity error:", error.message)
    }
  })

  socket.on("updateLocation", async (payload) => {
    try {
      const userId = resolveUserId(payload) || socket.userId
      const coords = payload?.coordinates

      if (!userId || !mongoose.isValidObjectId(userId)) return
      if (!Array.isArray(coords) || coords.length !== 2) return

      const lng = Number(coords[0])
      const lat = Number(coords[1])
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return

      socket.userId = userId

      await User.findByIdAndUpdate(userId, {
        $set: {
          location: {
            type: "Point",
            coordinates: [lng, lat],
          },
          isOnline: true,
          socketId: socket.id,
        },
      })
    } catch (error) {
      console.error("updateLocation error:", error.message)
    }
  })

  socket.on("disconnect", async () => {
    try {
      console.log("disconnect fired", socket.id)

      if (!socket.userId) return

      await User.findByIdAndUpdate(socket.userId, {
        $set: {
          socketId: null,
          isOnline: false,
        },
      })

      console.log("user offline", socket.userId)
    } catch (error) {
      console.error("disconnect error:", error.message)
    }
  })

  // ── Chat: send message to the other participant ─────────────────────────
  socket.on("sendMessage", async (payload) => {
    try {
      const { bookingId, message } = payload || {}
      if (!bookingId || !message) return

      // Find the booking to get the other participant's socket
      const booking = await mongoose.connection.db
        .collection("bookings")
        .findOne({ _id: new mongoose.Types.ObjectId(bookingId) })

      if (!booking) return

      const senderId = String(message.sender?._id || socket.userId)
      const otherUserId =
        String(booking.user) === senderId
          ? String(booking.partner)
          : String(booking.user)

      if (!otherUserId) return

      // Find the other user's socket
      const otherUser = await User.findById(otherUserId).lean()
      if (otherUser?.socketId) {
        io.to(otherUser.socketId).emit("newMessage", message)
      }
    } catch (error) {
      console.error("sendMessage error:", error.message)
    }
  })

  // ── Chat: join a booking room for real-time updates ─────────────────────
  socket.on("joinBooking", (bookingId) => {
    if (bookingId) {
      socket.join(`booking:${bookingId}`)
    }
  })

  socket.on("leaveBooking", (bookingId) => {
    if (bookingId) {
      socket.leave(`booking:${bookingId}`)
    }
  })
})

connectDb().then(() => {
  server.listen(port, () => {
    console.log("Started on port", port)
  })
})