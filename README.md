# SmartCare UI Application

A modern, comprehensive healthcare management application built with Vue 3, Vite, and integrated with SmartCare Services backend.

## 🌟 Features

### Core Healthcare Functionality
- **Patient Dashboard**: Comprehensive health overview with vital signs and health score
- **Doctor Discovery**: Advanced search and booking system for healthcare providers
- **Appointment Management**: Schedule, reschedule, and manage medical appointments
- **Medication Tracking**: Prescription management with refill reminders
- **Health Monitoring**: Vital signs tracking and health trend analysis
- **Medical Records**: Secure access to personal health information

### Technical Features
- **Backend Integration**: Seamless integration with SmartCare Services API
- **Demo Mode**: Fallback functionality with mock data for testing
- **Authentication**: JWT-based secure login with role-based access
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Real-time Updates**: Live data synchronization with backend services
- **Error Handling**: Graceful error handling with automatic fallbacks

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager
- SmartCare Services backend (optional for demo mode)

### Installation

```sh
# Clone the repository
git clone https://github.com/KaustubhS28/smartcare-app
cd smartcare-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### With Backend Services

1. **Start Backend Services** (optional):
   ```sh
   # Clone and start the backend
   git clone https://github.com/darsthakkar-cts/SmartCare-Services
   cd SmartCare-Services
   mvn spring-boot:run
   ```

2. **Configure Environment**:
   ```sh
   # Copy environment file
   cp .env.example .env
   
   # Update API URL if needed (default: http://localhost:8080/api/v1)
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```

3. **Start Frontend**:
   ```sh
   npm run dev
   ```

## 🔐 Demo Credentials

### Backend Mode (if SmartCare Services is running)
- **Admin User**: `admin` / `admin123`
- **Test User**: `testuser` / `test123`

### Demo Mode (standalone)
- **Demo User**: `demo@smartcare.com` / `demo`
- **Test User**: `testuser` / `test123`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   └── layout/          # Layout components
├── views/               # Page components
├── stores/              # Pinia state management
│   ├── auth.js          # Authentication store
│   ├── doctors.js       # Doctor management
│   ├── appointments.js  # Appointment management
│   ├── medications.js   # Medication tracking
│   └── healthTracking.js # Health data management
├── services/
│   └── api.js           # API client and endpoints
├── router/              # Vue Router configuration
└── data/                # Demo/fallback data
```

## 🔧 Available Scripts

### Development
```sh
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```sh
npm run test:unit    # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

### Code Quality
```sh
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🌐 Backend Integration

This application integrates with the SmartCare Services backend for:

- **Authentication**: JWT-based user authentication
- **Doctor Management**: Search and booking functionality
- **Appointments**: Real-time appointment management
- **Medications**: Prescription tracking and management
- **Health Data**: Vital signs and health monitoring

For detailed integration information, see [INTEGRATION.md](./INTEGRATION.md).

## 🛠️ Technology Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Build Tool**: Vite for fast development and building
- **State Management**: Pinia for reactive state management
- **Routing**: Vue Router for navigation
- **Styling**: CSS3 with custom properties and modern design
- **HTTP Client**: Fetch API with custom wrapper
- **Testing**: Vitest for unit tests, Playwright for E2E

## 📱 Responsive Design

The application is built with a mobile-first approach and supports:
- 📱 Mobile devices (320px+)
- 📊 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🔒 Security Features

- JWT token-based authentication
- Secure API communication
- Input validation and sanitization
- Role-based access control
- Automatic token refresh
- Secure localStorage handling

## 🚀 Deployment

### Build for Production
```sh
npm run build
```

### Deploy to Static Hosting
The built files in `dist/` can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Azure Static Web Apps

### Environment Variables
```sh
VITE_API_BASE_URL=https://your-backend-api.com/api/v1
VITE_NODE_ENV=production
```

## 📈 Performance

- ⚡ Fast development with Vite
- 📦 Optimized production builds
- 🔄 Lazy loading of routes
- 💾 Efficient state management
- 🖼️ Image optimization
- 📱 Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@smartcare.com
- 📖 Documentation: [Integration Guide](./INTEGRATION.md)
- 🐛 Issues: [GitHub Issues](https://github.com/KaustubhS28/smartcare-app/issues)

## 🔗 Related Projects

- [SmartCare Services Backend](https://github.com/darsthakkar-cts/SmartCare-Services) - Backend API services
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
