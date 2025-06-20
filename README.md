# EmotiJournal 🧠✨

An AI-powered journaling app that provides emotional analysis and visualization of your emotional journey through an interactive memory map.

<img alt="EmotiJournal Banner" src="https://example.com/banner-image.jpg">

## 💫 Features

### 📝 Smart Journaling
- Write or speak your thoughts in a beautiful, distraction-free interface
- Get AI-powered emotional analysis using Google's Gemini AI model
- Receive instant insights about your emotional state
- Track emotional patterns over time

### 🧠 Memory Map Visualization
- Interactive network graph of your emotional journey
- See connections between journal entries based on emotions, time, or chronology
- Click on nodes to see detailed information about each entry:
  - 💡 Dominant emotion with emoji representation
  - 📊 Detailed emotion scores (happiness, sadness, joy, anxiety, anger, calm)
  - 📜 Entry summary and mood analysis
  - 🕒 Timestamp and context
- Group entries by:
  - 😊 Emotion - Cluster similar emotional states together
  - 📅 Time - Group entries from the same day
  - ⏱️ Chronological - View your emotional journey in sequence
- Drag nodes to rearrange and explore your emotional landscape

### 🎤 Voice Companion
- Speak to an empathetic AI companion
- Receive thoughtful responses tailored to your emotional state
- Perfect for times when typing isn't convenient

### 🔒 Privacy First
Your journal is personal. EmotiJournal respects that:

- All entries are stored locally in your browser's localStorage
- User authentication for data isolation
- Your data never leaves your device except for temporary AI processing
- No server storage of your entries
- Complete control over your data

## 🧠 How the Memory Map Works

The Memory Map is the heart of EmotiJournal, providing a visual representation of your emotional journey:

- Each node represents a journal entry
- Nodes are color-coded by dominant emotion
- The size of each node indicates the intensity of the emotion
- Links between nodes show relationships:
  - Pink links connect entries with similar emotions
  - Green dashed links connect entries from the same day
  - Gray dotted links show chronological connections
- Click on any node to see detailed information about that entry
- Use the dropdown to change how entries are grouped
- Drag nodes to explore relationships and create custom arrangements

## 🚀 Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/emotijournal.git
   cd emotijournal
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with your Google AI API key
   ```properties
   VITE_GOOGLE_API_KEY="your_google_api_key_here"
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open your browser and start journaling!

## 🛠️ Technology Stack

- **Frontend**: React with Tailwind CSS
- **AI**: Google Gemini AI through @google/genai
- **Visualization**: D3.js for interactive graph visualization
- **Storage**: localStorage for client-side data persistence
- **Voice**: Web Speech API for voice recognition and synthesis
- **Authentication**: Client-side user management for data isolation

## 📦 Project Structure

```
emotijournal/
├── frontend/                # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── Components/      # React components
│   │   │   ├── Auth/        # Authentication components
│   │   │   ├── JournalEditor.jsx
│   │   │   ├── MemoryGraph.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EntryHistory.jsx
│   │   │   ├── VoiceCompanion.jsx
│   │   │   ├── EmotionTrends.jsx
│   │   │   └── Settings.jsx
│   │   ├── context/         # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx          # Main application
│   │   └── main.jsx         # Application entry point
│   ├── .env                 # Environment variables
│   └── package.json         # Dependencies and scripts
└── README.md                # Project documentation
```

## 🔮 Future Enhancements

- Enhanced user authentication for optional multi-device sync
- Exportable insights and reports
- Custom themes and personalization
- Guided journaling prompts
- Advanced data visualization options
- Mood tracking over time with trend analysis
- Community features (optional and privacy-focused)

## 📸 Screenshots

<div align="center">
  <img src="screenshots/journal.png" width="45%" alt="Journal Interface">
  <img src="screenshots/memory-map.png" width="45%" alt="Memory Map Visualization">
</div>

## 🔐 Security Notes

- API keys are stored in environment variables
- User data is isolated by user ID
- Authentication is client-side but ensures data privacy between users
- No sensitive data is transmitted except for temporary AI processing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

<p align="center">
  Made with ❤️ for better mental health through self-reflection and emotional awareness
</p>