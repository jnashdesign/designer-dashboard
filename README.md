# BrandEZ - Brand Asset Management Platform

BrandEZ is a streamlined platform that helps designers manage brand assets and collaborate with clients through interactive questionnaires and asset organization.

## Features

- **Interactive Questionnaires**: Create and customize branding questionnaires
- **Template Management**: Save and reuse questionnaire templates
- **Client Management**: Organize clients and their associated projects
- **Asset Organization**: Upload and manage brand assets for each project
- **Drag-and-Drop Interface**: Easily reorder questions and groups
- **Real-time Updates**: Changes are saved and synced automatically
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- React.js
- Firebase (Authentication, Firestore, Storage)
- Bootstrap for styling
- React Beautiful DND for drag-and-drop functionality

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/brandez.git
cd brandez
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm start
```

## Project Structure

- `/src/components` - React components
- `/src/pages` - Page components
- `/src/firebase` - Firebase configuration and utilities
- `/src/data` - Static data and default questions
- `/src/context` - React context providers
- `/src/styles` - CSS and styling files

## Usage

1. **Designer Flow**:
   - Create an account
   - Add clients
   - Create projects
   - Create and customize questionnaires
   - Manage brand assets

2. **Client Flow**:
   - Receive questionnaire link
   - Fill out questionnaire
   - View and download brand assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)
Project Link: [https://github.com/yourusername/brandez](https://github.com/yourusername/brandez)

## Acknowledgments

- [React Beautiful DND](https://github.com/atlassian/react-beautiful-dnd)
- [Firebase](https://firebase.google.com/)
- [Bootstrap](https://getbootstrap.com/)

