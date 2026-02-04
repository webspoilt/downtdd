# LinkDownloader - File Processing Platform

A modern, full-stack Next.js application for processing and downloading files from Terabox and Diskwala cloud storage links. Built with Next.js 16, TypeScript, Prisma, and shadcn/ui.

## ⚠️ Important Notice

This is a **demonstrative application** that showcases the architecture and features of a file processing platform. 

**Legal & Ethical Considerations:**
- This tool does not store any files on its servers
- All processing is done in real-time with automatic link expiration
- Users must have the right to access and download the content they process
- Always respect copyright laws and terms of service of third-party platforms
- Implement proper DMCA compliance before deployment

## Features

### Core Functionality
- ✅ **Link Processing**: Process Terabox and Diskwala cloud storage links
- ✅ **Folder Support**: Handle both single file and folder links from both platforms
- ✅ **ZIP Download**: Download multiple files as a single ZIP archive
- ✅ **Video Streaming**: Play videos directly without downloading
- ✅ **Auto-Expiration**: Links automatically expire after 5 seconds
- ✅ **No File Storage**: Files are processed on-the-fly, not stored on servers
- ✅ **Platform Detection**: Automatically detects Terabox or Diskwala from URL

### User Features
- ✅ **Authentication**: User registration and login system
- ✅ **Premium Membership**: Subscribe to premium for enhanced features
- ✅ **User Dashboard**: View account status and premium details

### Monetization
- ✅ **Ad Placement**: Strategic ad placement for free users
- ✅ **Premium Subscriptions**: Monthly subscription model ($4.99/month)
- ✅ **Ad-Free Experience**: Premium users enjoy no advertisements

### Premium Benefits
- 🚫 No advertisements
- ⏱️ No waiting time
- ⚡ Faster download speeds
- 📥 Multiple simultaneous downloads
- 💬 Priority support
- 🔗 Extended link expiration

## Tech Stack

### Core Framework
- **Next.js 16** with App Router
- **TypeScript 5** for type safety
- **React 19** for UI components

### Styling & UI
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library (New York style)
- **Lucide React** for icons
- **Framer Motion** for animations

### Database & Backend
- **Prisma ORM** with SQLite
- **bcryptjs** for password hashing
- **JSZip** for ZIP file creation
- **Next.js API Routes** for backend

### State Management
- **Zustand** for client state
- **React Hooks** for local state

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # User login endpoint
│   │   │   └── register/route.ts   # User registration endpoint
│   │   ├── process-link/
│   │   │   └── route.ts            # Link processing endpoint
│   │   ├── download/
│   │   │   └── route.ts            # File download endpoint
│   │   ├── download-zip/
│   │   │   └── route.ts            # ZIP download endpoint
│   │   └── premium/
│   │       └── upgrade/
│   │           └── route.ts        # Premium upgrade endpoint
│   ├── page.tsx                    # Main page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── db.ts                       # Prisma client
│   └── utils.ts                    # Utility functions
└── hooks/
    ├── use-toast.ts                # Toast notification hook
    └── use-mobile.ts               # Mobile detection hook

prisma/
├── schema.prisma                   # Database schema
└── ...                             # Prisma generated files

db/
└── custom.db                       # SQLite database
```

## Database Schema

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  isPremium     Boolean   @default(false)
  premiumExpires DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  links         Link[]
}
```

### Link Model
```prisma
model Link {
  id          String   @id @default(cuid())
  originalUrl String
  files       Json
  expiresAt   DateTime
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}
```

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Database (SQLite is configured by default)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-project
```

2. Install dependencies:
```bash
bun install
```

3. Set up the database:
```bash
bun run db:push
```

4. Run the development server:
```bash
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Link Processing

#### Process Link
```http
POST /api/process-link
Content-Type: application/json

{
  "url": "https://terabox.com/s/xxxxx",
  "userId": "user_id_optional"
}
```

**Supported Platforms:**
- Terabox: `https://terabox.com/s/...`
- Diskwala: `https://diskwala.com/...`
- Folder links: URLs containing `/s/`, `/folder/`, or `/share/`

Response:
```json
{
  "success": true,
  "files": [
    {
      "name": "[Terabox] Movie - Part 1.mp4",
      "size": "850.4 MB",
      "url": "https://terabox.com/s/xxxxx",
      "downloadUrl": "/api/download?fileId=...",
      "isVideo": true
    },
    {
      "name": "[Terabox] Movie - Part 2.mp4",
      "size": "920.7 MB",
      "url": "https://terabox.com/s/xxxxx",
      "downloadUrl": "/api/download?fileId=...",
      "isVideo": true
    }
  ],
  "expiresIn": 5,
  "linkId": "link_id"
}
```

#### Download File
```http
GET /api/download?fileId=...&linkId=...
```

#### Download Files as ZIP
```http
POST /api/download-zip
Content-Type: application/json

{
  "files": [
    {
      "name": "file1.mp4",
      "size": "125.4 MB",
      "url": "https://example.com/file1",
      "downloadUrl": "/api/download?fileId=...",
      "isVideo": true
    },
    {
      "name": "file2.pdf",
      "size": "2.3 MB",
      "url": "https://example.com/file2",
      "downloadUrl": "/api/download?fileId=...",
      "isVideo": false
    }
  ],
  "linkId": "link_id"
}
```

Response: Binary ZIP file

**Features:**
- Automatically appears when multiple files are available
- Creates a compressed ZIP archive containing all files
- Includes metadata for each file
- Checks link expiration before creating ZIP
- Downloads directly to the user's device

### Premium

#### Upgrade to Premium
```http
POST /api/premium/upgrade
Content-Type: application/json

{
  "userId": "user_id"
}
```

## Link Expiration System

The application implements a 5-second link expiration system:

1. **Link Processing**: When a user processes a link, the system creates a temporary download URL
2. **Database Storage**: Link information is stored in the database with an expiration timestamp
3. **Auto-Deletion**: A background task automatically deletes the link after 5 seconds
4. **Access Control**: Any attempt to access the link after expiration returns a 410 Gone error

```typescript
// Example from process-link/route.ts
const link = await db.link.create({
  data: {
    originalUrl: url,
    files: tempLinks,
    expiresAt: new Date(Date.now() + 5000), // 5 seconds
    userId: userId || null,
  }
})

// Auto-delete after 5 seconds
setTimeout(async () => {
  await db.link.delete({ where: { id: link.id } })
}, 5000)
```

## Monetization Strategy

### Ad Placement
- **Top Banner**: 728x90 ad banner above the main content
- **Middle Banner**: 300x250 ad banner after processing results
- **Bottom Banner**: 728x90 ad banner in the footer area
- **Premium Exemption**: Premium users see no advertisements

### Premium Pricing
- **Monthly Plan**: $4.99/month
- **Features**: Ad-free, no waiting, faster downloads, multiple downloads, priority support

### Implementation Notes
- Use Google AdSense or similar ad networks
- Implement ad blockers detection
- A/B test ad placements for optimal revenue
- Consider affiliate partnerships

## Security Considerations

### Implemented
- ✅ Password hashing with bcrypt
- ✅ Input validation on all endpoints
- ✅ Rate limiting (recommended for production)
- ✅ SQL injection prevention (via Prisma)
- ✅ XSS prevention (via React)

### Recommended for Production
- 🔒 Add CSRF protection
- 🔒 Implement rate limiting
- 🔒 Add CAPTCHA for link processing
- 🔒 Use HTTPS only
- 🔒 Implement session management with JWT
- 🔒 Add logging and monitoring
- 🔒 Regular security audits

## Deployment

### Free Hosting Options

**Frontend:**
- **Vercel**: Free tier with automatic deployments
- **Netlify**: Free hosting with CI/CD
- **Cloudflare Pages**: Free with global CDN

**Backend:**
- **Render**: Free tier with 750 hours/month
- **Railway**: Free credits monthly
- **Glitch**: Always free

**Database:**
- **SQLite**: Included (for development/small scale)
- **PostgreSQL on Supabase**: Free tier
- **MongoDB Atlas**: Free 512MB storage

### Environment Variables
Create a `.env` file:
```env
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="your-jwt-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
```

## Legal & Compliance

### Before Deployment
1. **Terms of Service**: Create comprehensive ToS
2. **Privacy Policy**: Implement privacy policy page
3. **DMCA Compliance**: Add DMCA takedown procedure
4. **Cookie Policy**: If using cookies/analytics
5. **GDPR Compliance**: If serving EU users

### Copyright Notice
Add copyright notices to all pages and clearly state that:
- The platform does not host any files
- Users are responsible for the content they access
- Copyright holders can request takedowns

## Performance Optimization

### Implemented
- ✅ Image optimization (via Next.js)
- ✅ Code splitting (automatic with Next.js)
- ✅ Lazy loading components
- ✅ Database indexing (via Prisma)

### Recommended
- 🚀 Implement caching (Redis for production)
- 🚀 Use CDN for static assets
- 🚀 Optimize database queries
- 🚀 Implement request caching
- 🚀 Use edge functions for faster responses

## Future Enhancements

- [ ] Real-time progress tracking for ZIP downloads
- [ ] Custom ZIP compression level selection
- [ ] Password-protected ZIP files
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] API for developers
- [ ] Multiple language support
- [ ] Dark mode toggle
- [ ] Download history
- [ ] Shareable links
- [ ] File preview for documents

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is for demonstration purposes. Please ensure you have the right to use and modify this code.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@example.com

## Acknowledgments

- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- Prisma team for the excellent ORM
- All open-source contributors

---

**Remember**: Always use this tool responsibly and respect copyright laws and terms of service.
