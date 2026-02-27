# Art Gallery Shop - Online Art Gallery Website

A complete online platform for buying and selling artworks with immersive 3D navigation, real-time chat, and bidding system.

## Features

### 🎨 User Roles
- **Artists**: Upload and manage artworks, chat with customers, enable bidding
- **Customers**: Browse artworks, chat with artists, purchase or bid on art, leave reviews
- **Administrators**: Manage users, approve artworks, moderate content

### 🚀 Key Features
- Immersive 3D navigation system
- Real-time chat between artists and customers
- Artwork bidding system
- Virtual wall preview for artworks
- Customer ratings and reviews
- Admin moderation panel
- Secure authentication system

## Tech Stack

### Frontend
- React.js
- Three.js / React Three Fiber (3D navigation)
- Framer Motion (animations)
- React Router (navigation)
- Axios (API calls)
- Socket.io-client (real-time chat)

### Backend
- Node.js
- Express.js
- MySQL
- Socket.io (WebSocket server)
- JWT (authentication)
- Multer (file uploads)
- Bcrypt (password hashing)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Step 1: Clone and Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 2: Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE art_gallery_db;
```

2. Run the database initialization script:
```bash
node server/database/init-db.js
```

### Step 3: Environment Configuration
1. Copy `.env` file and update with your configuration:
   - Database credentials
   - JWT secret key
   - Email settings (for contact form)

### Step 4: Start the Application

#### Development Mode
```bash
# Start backend server (port 5000)
npm run dev

# In another terminal, start React frontend (port 3000)
npm run client
```

#### Production Mode
```bash
# Build React app
npm run build

# Start server
npm start
```

## Project Structure
```
ArtGallery1/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── contexts/       # Context API
│       ├── services/       # API services
│       ├── styles/         # CSS files
│       └── utils/          # Utility functions
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── database/          # Database setup
│   └── server.js          # Entry point
├── uploads/               # Uploaded artwork images
├── .env                   # Environment variables
├── package.json
└── README.md
```

## Usage

### For Artists
1. Register as an artist
2. Wait for admin approval
3. Upload artworks with details
4. Enable bidding for high-demand pieces
5. Chat with interested customers

### For Customers
1. Register as a customer
2. Browse art collections
3. View artist profiles
4. Chat with artists
5. Purchase or bid on artworks
6. Leave reviews after purchase

### For Administrators
1. Login with admin credentials
2. Approve/reject artist registrations
3. Review and approve artworks
4. Monitor users and content
5. Handle customer queries

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Artworks
- `GET /api/artworks` - Get all artworks
- `GET /api/artworks/:id` - Get single artwork
- `POST /api/artworks` - Create artwork (Artist)
- `PUT /api/artworks/:id` - Update artwork (Artist)
- `DELETE /api/artworks/:id` - Delete artwork (Artist/Admin)

### Artists
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get artist profile
- `PUT /api/artists/:id/approve` - Approve artist (Admin)

### Orders & Bidding
- `POST /api/orders` - Create order
- `GET /api/orders/:userId` - Get user orders
- `POST /api/bids` - Place bid
- `GET /api/bids/:artworkId` - Get artwork bids

### Reviews
- `POST /api/reviews` - Add review
- `GET /api/reviews/:artworkId` - Get artwork reviews

### Chat
- WebSocket connection on `/socket.io`

## Default Admin Credentials
```
Email: admin@artgallery.com
Password: admin123
```
**Important**: Change these credentials after first login!

## License
MIT

## Support
For issues and questions, use the contact form on the website or email: support@artgallery.com
