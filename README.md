A full-stack real-time auction platform built using the MERN Stack, where users can create auctions, explore available auctions, and participate in live bidding.

The platform supports two types of users — AUCTIONEER and BIDDER — with role-based access control, JWT authentication, persistent auction storage, and real-time bid updates powered by Socket.IO.

Features:
User registration and login.
JWT-based authentication.
Password hashing using bcrypt.
Role-based access control.
Auctioneers can create new auctions.
View available auctions on the homepage.
View auctions created by the logged-in auctioneer.
Delete auctions.
Auction data is persisted in MongoDB.
Live bidding using Socket.IO.
Dedicated Socket.IO rooms for individual auctions.
Instant bid updates to connected participants.
Server-side bid validation.
MongoDB atomic updates using findOneAndUpdate() to prevent competing bids from overwriting each other.

Frontend:
React.js
Vite
Tailwind CSS
Socket.IO Client

Backend:
Node.js
Express.js
Socket.IO
JWT Authentication
bcrypt

Database:
MongoDB
Mongoose ODM

Development Tools:
Git & GitHub
Postman
VS Code
