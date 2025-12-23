# Kenmark ITan Solutions - AI Chatbot

A full-stack AI-powered chatbot system for Kenmark ITan Solutions website, built with Next.js 16, TypeScript, MongoDB, and local LLM integration.

## 🌟 Features

- **AI-Powered Chatbot**: Intelligent virtual assistant using RAG (Retrieval Augmented Generation) approach
- **Knowledge Base Management**: Upload and manage Excel files containing FAQs, services, and company information
- **Session Management**: Persistent chat history during user sessions
- **Analytics Dashboard**: Track most asked questions and user interactions
- **Responsive UI**: Modern, clean interface with dark mode support
- **Admin Panel**: Easy-to-use interface for managing knowledge base and viewing analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.x (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS 4.x
- **Database**: MongoDB with Prisma ORM
- **AI/LLM**: Ollama (Local LLM) with fallback to Groq API
- **File Processing**: xlsx library for Excel parsing
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and npm/yarn
- MongoDB (local or MongoDB Atlas)
- Ollama (for local LLM) - [Download here](https://ollama.ai)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd KENMARK
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/kenmark_chatbot"
# Or use MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/kenmark_chatbot"

# Ollama Configuration (Local LLM)
OLLAMA_API_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2" # Options: llama3.2, mistral, phi, etc.

# Alternative: Free AI APIs (uncomment if not using Ollama)
# GROQ_API_KEY="your_groq_api_key"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set Up Ollama (Local LLM)

If you want to use local LLM:

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model:
   ```bash
   ollama pull llama3.2
   # or
   ollama pull mistral
   # or
   ollama pull phi
   ```
3. Start Ollama server (usually runs automatically)

**Note**: If Ollama is not available, the system will attempt to use Groq API (if configured) or provide a fallback response.

### 5. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# (Optional) Seed initial knowledge base
npm run seed
```

### 6. Create Sample Excel File (Optional)

```bash
# Generate sample Excel file from template
npm run create-excel
```

This creates `public/sample-knowledge.xlsx` that you can use as a template or upload directly.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
KENMARK/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat API endpoint
│   │   └── admin/          # Admin API endpoints
│   ├── admin/              # Admin panel page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   └── Chatbot.tsx         # Main chatbot component
├── lib/
│   ├── ai.ts               # AI/LLM integration
│   ├── knowledge.ts        # Knowledge base utilities
│   └── prisma.ts           # Prisma client
├── prisma/
│   └── schema.prisma       # Database schema
├── public/
│   └── sample-knowledge.xlsx  # Sample Excel file
└── README.md
```

## 📊 Excel File Format

The chatbot accepts Excel files (`.xlsx`) with the following structure. A sample CSV file is provided in `public/sample-knowledge.csv` which can be converted to Excel format.

**To create the sample Excel file:**
```bash
npm install
node scripts/create-sample-excel.js
```

This will create `public/sample-knowledge.xlsx` that you can use as a template.

| Category | Question                        | Answer                                                     |
|----------|---------------------------------|------------------------------------------------------------|
| About    | What is Kenmark ITan Solutions? | Kenmark ITan Solutions is a technology company focused on… |
| Services | What services are offered?      | Consulting, AI solutions, training, etc.                   |
| Contact  | How can I contact the company?  | Visit the contact page on kenmarkitan.com                  |

**Required Columns:**
- `Category` (or `category`): The category of the information
- `Answer` (or `answer`): The answer/content
- `Question` (or `question`): Optional, the question if applicable

## 🎯 Usage

### For Users

1. Visit the homepage
2. Click the chatbot button in the bottom right corner
3. Start chatting! The AI will answer questions based on the knowledge base

### For Admins

1. Navigate to `/admin`
2. **Upload Excel**: Upload knowledge base files in the "Upload Excel" tab
3. **View Knowledge**: Browse all knowledge entries in the "Knowledge Base" tab
4. **Analytics**: View most asked questions and statistics in the "Analytics" tab

## 🔧 Configuration

### AI Model Selection

Edit `.env` to change the Ollama model:

```env
OLLAMA_MODEL="llama3.2"  # Options: llama3.2, mistral, phi, llama2, etc.
```

### Using Alternative AI APIs

If you prefer not to use Ollama, you can use Groq (free tier available):

1. Get API key from [groq.com](https://groq.com)
2. Add to `.env`:
   ```env
   GROQ_API_KEY="your_api_key_here"
   ```
3. The system will automatically fallback to Groq if Ollama is unavailable

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Database Setup for Production

For production, use MongoDB Atlas:

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `DATABASE_URL` in environment variables

For detailed deployment steps, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🧪 Testing

Test the chatbot by asking questions like:
- "What services do you offer?"
- "Tell me about Kenmark ITan Solutions"
- "How can I contact you?"

## 📝 API Endpoints

### POST `/api/chat`
Send a chat message and get AI response.

**Request:**
```json
{
  "message": "What services do you offer?",
  "sessionId": "session_123",
  "history": []
}
```

**Response:**
```json
{
  "response": "We offer consulting, AI solutions, and training...",
  "context": "Found relevant information"
}
```

### POST `/api/admin/upload`
Upload Excel knowledge base file.

**Request:** FormData with `file` field

### GET `/api/admin/knowledge`
Get all knowledge base entries.

### GET `/api/admin/analytics`
Get analytics data.

## 🐛 Troubleshooting

### Ollama Connection Error

If you see "Ollama not available" errors:
1. Ensure Ollama is installed and running
2. Check `OLLAMA_API_URL` in `.env`
3. Verify model is pulled: `ollama list`
4. System will fallback to Groq API if configured

### Database Connection Error

1. Verify MongoDB is running
2. Check `DATABASE_URL` in `.env`
3. Run `npm run prisma:push` to sync schema

### Excel Upload Issues

1. Ensure file is `.xlsx` format
2. Check column names match: `Category`, `Question`, `Answer`
3. Verify file is not corrupted

## 📄 License

This project is created for Kenmark ITan Solutions.

## 👥 Contributing

This is a project assignment. For questions or issues, please contact the development team.

## 🔗 Links

- Company Website: [kenmarkitan.com](https://kenmarkitan.com)
- Ollama: [ollama.ai](https://ollama.ai)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
- Prisma Docs: [prisma.io/docs](https://www.prisma.io/docs)

---

**Built with ❤️ for Kenmark ITan Solutions**

