# Vegah Project - AI Content Generation Platform

## Overview
Vegah is a powerful AI-driven content generation and orchestration platform that enables users to create various types of content including images, audio, video, and music through an intuitive workflow pipeline.

## Features

### Multi-Modal Content Generation
- 🖼️ **Image Generation**
- 🎵 **Music Creation**
- 🎤 **Audio Production**
- 🎬 **Video Generation**

### Smart Workflow Management
- Intelligent orchestration pipeline
- Real-time progress tracking
- Quality score analysis
- Performance metrics

### History Tracking
- Comprehensive generation history
- Quality metrics visualization
- Duration tracking
- Performance analytics

## Tech Stack

- **Frontend Framework:** React
- **Data Fetching:** TanStack Query (React Query)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Date Handling:** date-fns
- **Icons:** Lucide React

## Project Structure

```
vegah-project/
├── src/
│   ├── api/
│   │   └── base44Client.js      # API client configuration
│   ├── components/
│   │   ├── ui/
│   │   │   └── card.jsx         # Reusable UI components
│   │   └── orchestration/
│   │       ├── ConceptInput.jsx    # User input handling
│   │       ├── WorkflowPipeline.jsx # Generation pipeline
│   │       └── ResultDisplay.jsx    # Output visualization
│   ├── pages/
│   │   ├── History.jsx          # Generation history view
│   │   └── Orchestration.jsx    # Main workflow page
│   ├── App.jsx
│   └── index.js
└── package.json
```

## Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd vegah-project
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a .env file in the root directory:
```
REACT_APP_BASE44_API_URL=your_api_url
REACT_APP_BASE44_API_KEY=your_api_key
```

4. **Start the development server**
```bash
npm start
```

Visit http://localhost:3000 to see the application.

## Available Scripts

- `npm start` - Run the app in development mode
- `npm test` - Execute test suite
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

## Development

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0

### Code Style
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Maintain consistent formatting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React Team for the amazing framework
- TanStack Query for efficient data fetching
- Tailwind CSS for the styling system
- Framer Motion for smooth animations
