# 🎬 Content Creator Tool

An AI-powered video transcription and content generation tool built with Next.js, featuring automatic video transcription, AI-generated titles, and modern UI/UX.

## ✨ Features

- **🎥 Video Upload**: Drag & drop interface supporting MP4, MOV, AVI, MKV, WebM, M4V
- **🎤 AI Transcription**: Powered by OpenAI Whisper and Google Cloud Speech-to-Text
- **📝 Auto-Generated Content**: AI-generated video titles and descriptions
- **📊 Real-time Progress**: Live transcription status tracking
- **💾 Transcript Management**: Copy and download transcript functionality
- **🔒 Secure Storage**: Supabase integration for file storage and database

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI Services**: OpenAI (Whisper + GPT-3.5), Google Cloud Speech-to-Text
- **Testing**: Jest, React Testing Library
- **UI Components**: Radix UI, shadcn/ui

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Google Cloud account (optional, for larger files)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd content-creator-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local` file:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Google Cloud Configuration (Optional)
   GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-key.json
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `database-schema.sql`
   - Create a `videos` storage bucket (public)
   - Enable Row Level Security (RLS)

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
content-creator-tool/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── upload/        # File upload endpoint
│   │   │   ├── transcribe/    # Transcription endpoint
│   │   │   └── generate-titles/ # AI content generation
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── VideoUpload.tsx    # File upload component
│   │   ├── TranscriptionStatus.tsx # Progress tracking
│   │   ├── TranscriptDisplay.tsx   # Transcript viewer
│   │   └── progress.tsx       # Progress bar
│   ├── lib/                   # Utility libraries
│   │   ├── openai.ts          # OpenAI integration
│   │   ├── googleSpeech.ts    # Google Cloud Speech-to-Text
│   │   ├── supabase.ts        # Supabase client
│   │   └── utils.ts           # Helper functions
│   └── __tests__/             # Test files
├── public/                    # Static assets
├── database-schema.sql        # Database setup
└── README.md                  # This file
```

## 🎯 Usage

1. **Upload Video**: Drag and drop or click to select a video file (max 25MB for OpenAI Whisper, 500MB for Google Cloud)
2. **Transcription**: The system automatically starts transcribing your video
3. **View Progress**: Watch real-time transcription progress
4. **Get Results**: View the transcript and AI-generated titles/descriptions
5. **Export**: Copy or download the transcript

## 🔧 Configuration

### File Size Limits

- **OpenAI Whisper**: 25MB maximum
- **Google Cloud Speech-to-Text**: 500MB maximum (60 minutes)

### Supported Formats

- Video: MP4, MOV, AVI, MKV, WebM, M4V
- Audio: MP3, WAV, FLAC, OGG

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### Live Demo
🌐 **[https://buildathon-gamma.vercel.app/](https://buildathon-gamma.vercel.app/)**

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Database Schema

The application uses two main tables:

- **transcriptions**: Stores video URLs, transcripts, and processing status
- **generated_content**: Stores AI-generated titles and descriptions

See `database-schema.sql` for the complete schema.

## 🔒 Security

- Environment variables for sensitive data
- Row Level Security (RLS) in Supabase
- File size validation
- Type checking with TypeScript
- Input sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-username/content-creator-tool/issues) page
2. Review the environment setup
3. Ensure all API keys are correctly configured
4. Check Supabase project status

## 🎉 Acknowledgments

- OpenAI for Whisper and GPT APIs
- Google Cloud for Speech-to-Text
- Supabase for backend infrastructure
- Next.js team for the amazing framework
- The open-source community

---

**Built with ❤️ by Bhavya Barri**