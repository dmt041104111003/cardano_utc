import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js'
import userRouter from './routes/useRoutes.js'
import certificateRouter from './routes/certificateRoutes.js'
import notificationRouter from './routes/notificationRoutes.js'
import blockchainRouter from './routes/blockchainRoute.js'
import nftRouter from './routes/nftRoute.js'
import addressRouter from './routes/addressRoute.js'

const app = express()

//connect DB
await connectDB()
await connectCloudinary()

app.use(cors())

app.use(clerkMiddleware())

app.get('/', (req, res) => res.send("API Working"))

app.post('/clerk', express.json(), clerkWebhooks)

app.use('/api/educator', express.json(), educatorRouter)

app.use('/api/course', express.json(), courseRouter)

app.use('/api/user', express.json(), userRouter)

app.use('/api/certificate', express.json(), certificateRouter)

app.use('/api/notification', express.json(), notificationRouter)

app.use('/api/blockchain', express.json(), blockchainRouter)

app.use('/api/nft', express.json(), nftRouter)

app.use('/api/address', express.json(), addressRouter)

app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

app.use((err, req, res, next) => {
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error', 
        error: err.message 
    });
});

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
