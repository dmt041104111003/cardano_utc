<h1 align="center">📚 LMS | CaUTC</h1>
<h3 align="center">A Research and Development Project for a Modern Learning Management System</h3>

Web demo: [https://client-react-brown.vercel.app/]
## Overview

Cardano UTC is an online learning platform integrated with Cardano blockchain technology, enabling certificate verification through NFTs and payments using ADA cryptocurrency. This project combines modern technologies to create a reliable and transparent Learning Management System (LMS).

## Key Features

### For Students
- Register and participate in online courses
- Pay tuition fees using ADA or PayPal
- Receive certificates as NFTs on the Cardano blockchain
- Verify certificates via QR code or direct input
- Search and browse courses by category

### For Educators
- Create and manage courses
- Track enrolled students
- Issue NFT certificates to students
- Upgrade to Premium account to unlock additional features
- Manage notifications and interact with students

## Technologies Used

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB
- Blockfrost API (Cardano blockchain)
- PayPal API

### Authentication & Security
- Clerk Authentication
- JWT (JSON Web Tokens)

## Installation and Running the Project

### Requirements
- Node.js (v14+)
- npm or yarn
- MongoDB
- Blockfrost API key
- PayPal Developer account

### Frontend Setup

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Run the app in development mode
npm start
```

### Backend Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Run the server
npm start
```

## Environment Configuration

### Frontend Environment File (client/.env)

```
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Backend Environment File (server/.env)

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BLOCKFROST_API_KEY=your_blockfrost_api_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Contributing

We welcome all contributions to the project! If you'd like to contribute, please:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is distributed under the MIT License. See the `LICENSE` file for more information.

## Contact

If you have any questions, please contact us via email: [daomanhtung4102003@gmail.com](mailto:daomanhtung4102003@gmail.com)

---

© 2025 Cardano UTC. All rights reserved.
