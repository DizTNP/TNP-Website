# Top Notch Plumbing (TNP) Website

A professional, responsive website for Top Notch Plumbing, serving Paducah, KY since 2019.

## 🌟 Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Professional Branding**: Gold and black color scheme with custom TNP logo
- **Multi-Page Structure**: Home, Services, About, Scheduling, and Contact pages
- **Interactive Scheduling**: Custom appointment booking form with validation
- **SEO Optimized**: Semantic HTML, meta tags, and structured data
- **Modern UI/UX**: Smooth animations, hover effects, and professional styling

## 🚀 Quick Start

### Prerequisites
- Python 3.x (for local development server)
- Node.js 18+ (for future enhancements)
- Git (for version control)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DizTNP/TNP-Website.git
   cd TNP-Website
   ```

2. **Start the development server**
   ```bash
   # Using Python (current method)
   python -m http.server 8000
   
   # Or using npm (future)
   npm start
   ```

3. **Open your browser**
   Navigate to `http://localhost:8000`

## 📁 Project Structure

```
TNP-Website/
├── index.html          # Homepage
├── about.html          # About Us page
├── services.html       # Services page
├── scheduling.html     # Appointment booking
├── contact.html        # Contact page
├── styles.css          # Main stylesheet
├── script.js           # Main JavaScript
├── scheduling.js       # Scheduling form logic
├── images/
│   └── tnp-logo-no-backgrond.gif  # Company logo
├── package.json        # Node.js configuration
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🎨 Design System

### Color Palette
- **Primary Gold**: `#D4AF37` (accents, borders, buttons)
- **Secondary Black**: `#000000` (text, headings)
- **Accent Yellow**: `#FFD700` (highlights, CTAs)
- **Neutral Gray**: `#A9A9A9` (section backgrounds)
- **Background White**: `#FFFFFF`

### Typography
- **Primary Font**: Roboto (Google Fonts)
- **Fallback**: Arial, sans-serif

## 🔧 Future Enhancements

### Planned Features
- [x] **QuickBooks Integration**: ✅ New customer signup form automatically creates customer records in QuickBooks
- [ ] **Email Notifications**: Send confirmation emails for appointments
- [x] **Customer Database**: ✅ Integrated with QuickBooks Online for customer management
- [ ] **Admin Dashboard**: Manage appointments and customers
- [ ] **Payment Processing**: Online payment integration
- [ ] **Blog/News Section**: Company updates and plumbing tips

### QuickBooks Integration Setup

The website now includes automatic QuickBooks Online integration for new customer signups.

#### Environment Variables Required (Set in Netlify Dashboard):
```
QB_CLIENT_ID=your_quickbooks_client_id
QB_CLIENT_SECRET=your_quickbooks_client_secret
QB_ACCESS_TOKEN=your_quickbooks_access_token
QB_REFRESH_TOKEN=your_quickbooks_refresh_token
QB_REALM_ID=your_quickbooks_realm_id
QB_ENVIRONMENT=sandbox  # or 'production' for live data
```

#### QuickBooks OAuth Setup:
1. **Create QuickBooks App**: Go to [Intuit Developer](https://developer.intuit.com/)
2. **Get OAuth Credentials**: Create a new app and get Client ID/Secret
3. **Set Redirect URLs**: Add your Netlify domain to allowed redirects
4. **Get Access Token**: Use OAuth flow to get initial tokens
5. **Set Environment Variables**: Add all QB_* variables to Netlify

#### Testing:
- Use `QB_ENVIRONMENT=sandbox` for testing
- Use `QB_ENVIRONMENT=production` for live data
- Test the form submission to verify QuickBooks integration

### Node.js Backend (Future)
When ready to add more backend functionality:

```bash
# Install additional dependencies
npm install express cors dotenv nodemailer

# Add to package.json scripts
"server": "node server.js",
"dev-server": "nodemon server.js"
```

## 📞 Contact Information

- **Company**: Top Notch Plumbing (TNP)
- **Phone**: (270) 681-8162
- **Email**: info@tnpplumbing.com
- **Location**: Paducah, KY
- **Founded**: 2019
- **Facebook**: [facebook.com/DavisTNP](https://facebook.com/DavisTNP)

## 🛠️ Development

### Adding New Features
1. Create a new branch: `git checkout -b feature/new-feature`
2. Make your changes
3. Test locally: `python -m http.server 8000`
4. Commit changes: `git commit -m "Add new feature"`
5. Push to GitHub: `git push origin feature/new-feature`

### Deployment
Currently a static site that can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any web hosting provider

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is a private business website. For questions or suggestions, contact Top Notch Plumbing directly.

---

**Built with ❤️ for Top Notch Plumbing - Serving Paducah, KY since 2019**
