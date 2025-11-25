# CampusShare - Peer-to-Peer Rental Platform

## 🚀 Features
- **Item Listings** with image upload
- **Search & Filter** by category, price, deposit
- **Cash on Delivery** payment system
- **In-app Messaging** between users
- **Real-time Notifications**
- **User Authentication** & profiles
- **Rental Management** with approval system
- **Analytics Dashboard**
- **Dark/Light Theme** toggle
- **Mobile Responsive** design

## 📋 Prerequisites
1. **Node.js** (v16+) - [Download](https://nodejs.org/)
2. **MySQL Server** - [Download](https://dev.mysql.com/downloads/mysql/)

## ⚡ Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup Database:**
   ```sql
   -- Execute in MySQL Workbench:
   source database.sql
   source cod_schema.sql
   source test_data.sql  -- Optional sample data
   ```

3. **Configure Environment:**
   ```env
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start Application:**
   ```bash
   npm run dev
   ```

5. **Access Application:**
   - Open: `http://localhost:3000`
   - Register/Login to start using

## 🎯 How to Use

### For Lenders:
1. **List Items**: Dashboard → "+ New Listing"
2. **Manage Requests**: Check "Rental requests" section
3. **Approve/Reject**: Use action buttons
4. **Message Borrowers**: Direct communication

### For Borrowers:
1. **Browse Items**: Visit listings page
2. **Request Rental**: Select dates, confirm booking
3. **Pay COD**: Cash on delivery at pickup
4. **Message Lender**: Arrange pickup details

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Items
- `GET /api/items` - Browse all items
- `GET /api/items/:id` - Item details
- `POST /api/items/upload` - Create listing with image
- `GET /api/items/categories/all` - Get categories
- `GET /api/items/user/:userId` - User's items

### Rentals
- `POST /api/rentals` - Create rental request
- `GET /api/rentals/user/:userId` - User's rentals
- `GET /api/rentals/requests/:userId` - Rental requests
- `PUT /api/rentals/:id/status` - Update status

## 📱 Pages
- `/` - Home page
- `/listings.html` - Browse items
- `/item.html` - Item details
- `/booking.html` - COD confirmation
- `/dashboard.html` - User dashboard
- `/messages.html` - In-app chat
- `/notifications.html` - Alerts
- `/profile.html` - User profile
- `/analytics.html` - Performance metrics

## 💡 Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **File Upload**: Multer
- **Payment**: Cash on Delivery

## 🔒 Security
- Password hashing with bcrypt
- JWT token authentication
- File upload validation
- SQL injection prevention
- XSS protection

## 📞 Support
For issues or questions, contact the development team.