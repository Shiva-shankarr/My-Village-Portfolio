# Village Portfolio Website 🏠

A comprehensive full-stack MERN website showcasing Puriya Thanda village, its culture, development, and community.

## 🌟 Features

- **Modern Design**: Fully responsive, mobile-first design with beautiful animations
- **Real-time Updates**: Latest village news and developments
- **Interactive Gallery**: Image and video galleries with categories
- **Admin Dashboard**: Secure content management system
- **SEO Optimized**: Enhanced visibility on search engines
- **Performance Focused**: Optimized loading and rendering

## 🛠 Tech Stack

### Frontend
- React.js (v19.1.0)
- TailwindCSS for styling
- Redux Toolkit for state management
- Framer Motion for animations
- React Router for navigation
- Axios for API calls

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary for media storage
- Error logging and monitoring

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/village-portfolio.git
   cd village-portfolio
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:
   - Create `.env` in server directory
   - Create `.env.local` in client directory
   (See .env.example files for required variables)

4. Start development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd client
   npm start
   ```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
3. Add environment variables
4. Deploy!

### Backend (Render)
1. Connect your GitHub repository to Render
2. Configure service:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Add environment variables
4. Deploy!

## 🔐 Environment Variables

### Frontend (.env.local)
```
REACT_APP_API_URL=your_api_url
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📱 Responsive Design

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔄 API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/verify

### Gallery
- GET /api/gallery
- POST /api/gallery
- PUT /api/gallery/:id
- DELETE /api/gallery/:id

### Videos
- GET /api/videos
- POST /api/videos
- PUT /api/videos/:id
- DELETE /api/videos/:id

### Updates
- GET /api/updates
- POST /api/updates
- PUT /api/updates/:id
- DELETE /api/updates/:id

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test
```

## 🔍 Security

- JWT Authentication
- Input validation
- XSS protection
- CORS configuration
- Rate limiting
- Secure headers
- Error logging

## 📈 Performance

- Image optimization
- Lazy loading
- Code splitting
- Caching strategies
- CDN usage
- Minification

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- Developer: [Your Name]
- Designer: [Designer Name]
- Project Manager: [PM Name]

## 📞 Contact

For any queries or support, please contact:
- Email: support@villageportfolio.com
- Website: https://villageportfolio.com 