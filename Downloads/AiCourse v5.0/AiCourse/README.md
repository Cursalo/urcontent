# Cursalo - AI Course Generation Platform

Cursalo is a Spanish-first AI-powered course creation platform that allows users to generate comprehensive courses using artificial intelligence technology.

## Features

- 🌍 **Spanish-first internationalization** with English fallback
- 🤖 **AI-powered course generation** using Google Generative AI
- 📚 **Comprehensive course content** with theory, images, and video support
- 💳 **Multiple payment gateways** (Stripe, Flutterwave, MercadoPago, PayPal, Paystack, Razorpay)
- 👥 **User management** with subscription plans
- 🎨 **Modern UI** with dark/light theme support
- 📱 **Responsive design** for all devices
- 🔒 **Secure authentication** with Google OAuth integration

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **React Router** for navigation
- **React i18next** for internationalization
- **React Query** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Google Generative AI** for course content
- **Multiple payment gateways** integration
- **Nodemailer** for email services
- **YouTube API** for video content

## Deployment on Render.com

This project is configured for deployment on Render.com with the included `render.yaml` configuration.

### Quick Deploy

1. **Fork/Clone this repository**
2. **Connect to Render.com**:
   - Go to [render.com](https://render.com)
   - Connect your GitHub account
   - Create a new Web Service
   - Connect this repository

3. **Environment Variables**:
   Copy the variables from `.env.example` and set them in your Render dashboard:
   
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://your-connection-string
   EMAIL=your-email@gmail.com
   PASSWORD=your-app-password
   API_KEY=your-google-ai-api-key
   UNSPLASH_ACCESS_KEY=your-unsplash-key
   STRIPE_SECRET_KEY=your-stripe-secret
   COMPANY=Cursalo
   WEBSITE_URL=https://your-app.onrender.com
   ```

4. **Deploy**: Render will automatically build and deploy your application

### Manual Deployment Steps

If you prefer manual configuration:

1. **Build Command**:
   ```bash
   npm install && npm run build && cd server && npm install
   ```

2. **Start Command**:
   ```bash
   node server/server.js
   ```

3. **Service Root Directory**: Leave blank (defaults to repository root)

## Local Development

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Environment variables (copy from `.env.example`)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Cursalo/cursalo.git
   cd cursalo
   ```

2. **Install dependencies**:
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start development**:
   ```bash
   # Start frontend (development)
   npm run dev
   
   # Start backend (in another terminal)
   cd server
   npm start
   ```

## Project Structure

```
cursalo/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── i18n/              # Internationalization files
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility libraries
├── server/                # Backend source code
│   ├── server.js          # Main server file
│   └── package.json       # Server dependencies
├── public/                # Static assets
├── dist/                  # Built frontend files
├── render.yaml           # Render.com configuration
└── package.json          # Frontend dependencies
```

## Internationalization

Cursalo features comprehensive Spanish-first internationalization:

- **Primary Language**: Spanish (es)
- **Fallback Language**: English (en)
- **Translation Files**: Located in `src/i18n/locales/`
- **Namespaces**: auth, dashboard, payment, home, blog, common, legal

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all translations are updated
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the Cursalo team or create an issue in the GitHub repository.