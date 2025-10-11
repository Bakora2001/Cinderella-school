# Cinderella School Assignment Management System

A comprehensive assignment management system built for Cinderella International School with role-based access for Administrators, Teachers, and Students.

## 🎯 Features

### 🔐 Authentication System
- **Role-based login** (Admin, Teacher, Student)
- **Secure authentication** with demo credentials for testing
- **Beautiful login interface** with school branding

### 👥 User Roles & Dashboards

#### 🛡️ Administrator Dashboard
- **User Management**: Create, edit, and manage student/teacher accounts
- **System Analytics**: View comprehensive statistics and reports
- **Activity Monitoring**: Track all platform activities in real-time
- **Online Status Tracking**: Monitor who's currently active

#### 🎓 Teacher Dashboard
- **Assignment Creation**: Create assignments with file attachments
- **Submission Management**: Review and grade student submissions
- **Student Tracking**: Monitor student activity and online status
- **Calendar Integration**: Manage assignment deadlines
- **Document Management**: Preview and download student work

#### 📚 Student Dashboard
- **Assignment Viewing**: Access all assigned work with clear due dates
- **File Submission**: Upload completed assignments (PDF, DOC, images)
- **Grade Tracking**: View grades and teacher feedback
- **Help Section**: Built-in instructions for system usage
- **Deadline Alerts**: Get notified about upcoming and overdue assignments

### 🎨 Design Features
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on all devices
- **School Colors**: Black, white, and minimal red accent
- **Modern UI**: Clean, professional interface using shadcn/ui components

### 📋 Core Functionality
- **Document Preview**: View files before downloading
- **Activity Timeline**: Track all system activities
- **Notification System**: Real-time alerts and updates
- **Comment System**: Teacher-student communication
- **Search & Filter**: Find assignments and submissions quickly
- **Online Status**: See who's currently active
- **File Management**: Support for multiple file formats

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom design system

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ 
- pnpm (recommended) or npm

### Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cinderella-school-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   pnpm run dev
   # or
   npm run dev
   ```

4. **Build for production**
   ```bash
   pnpm run build
   # or
   npm run build
   ```

## 🔑 Demo Credentials

### Student Account
- **Email**: alice.student@cinderella.edu
- **Password**: student123

### Teacher Account
- **Email**: john.teacher@cinderella.edu
- **Password**: teacher123

### Administrator Account
- **Email**: admin@cinderella.edu
- **Password**: admin123

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   └── LoginPage.tsx
│   ├── Dashboard/
│   │   ├── AdminDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   └── StudentDashboard.tsx
│   ├── Layout/
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── Shared/
│   │   ├── ActivityTimeline.tsx
│   │   ├── DocumentPreview.tsx
│   │   └── NotificationPanel.tsx
│   └── ui/ (shadcn/ui components)
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── data/
│   └── mockData.ts
├── hooks/
│   └── useLocalStorage.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## 🎨 Customization

### Theme Configuration
The system supports both light and dark modes. Colors can be customized in:
- `src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind configuration

### School Branding
Update school information in:
- `src/components/Auth/LoginPage.tsx` - Login page branding
- `src/components/Layout/Sidebar.tsx` - Navigation branding
- `index.html` - Page title and meta information

## 🔧 Configuration

### Environment Variables
Create a `.env` file for production configuration:
```env
VITE_API_URL=your-api-endpoint
VITE_SCHOOL_NAME=Cinderella School
VITE_SCHOOL_DOMAIN=cinderella.edu
```

### Mock Data
The system currently uses mock data located in `src/data/mockData.ts`. Replace this with real API calls when integrating with a backend.

## 🚀 Deployment

### Build for Production
```bash
pnpm run build
```

### Deploy to Static Hosting
The built files in the `dist/` folder can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

### Server Requirements
- **Minimum**: Any web server that can serve static files
- **Recommended**: CDN for better performance
- **SSL Certificate**: Required for production use

## 🔄 Backend Integration

To connect with a real backend:

1. **Replace mock data** in `src/data/mockData.ts`
2. **Update API calls** in context files
3. **Add environment variables** for API endpoints
4. **Implement file upload** service
5. **Add real authentication** system

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎓 About Cinderella School

Cinderella International School is committed to providing innovative educational solutions that prepare students for success in the digital age. This assignment management system represents our dedication to leveraging technology for enhanced learning experiences.

---

**Built with ❤️ for Cinderella International School**