
# Quiz Room Rush

A real-time quiz application that allows hosts to create quiz rooms and participants to join via unique links. Built with React, TypeScript, and Socket.io.

## Features

- No sign-up required
- Create quiz rooms and become the host
- Share a unique room code or link for participants to join
- Upload or paste questions in bulk (CSV/JSON format)
- Multiple choice questions with difficulty levels
- Timed quiz rounds (12 seconds per question)
- Real-time leaderboard and scoring
- Final results with statistics

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/quiz-room-rush.git
cd quiz-room-rush
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to:

```
http://localhost:8080
```

### Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── pages/          # Application pages
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
```

## Usage

1. **Create a Room**:
   - Enter your name and click "Create Room"
   - Share the room code or join link with participants

2. **Join a Room**:
   - Enter your name and the room code
   - Click "Join Quiz"

3. **Host Controls**:
   - Upload questions (CSV or JSON format)
   - Start the quiz when all participants have joined
   - View progress and control the flow of questions

4. **Playing the Quiz**:
   - Answer questions within the 12-second time limit
   - View the leaderboard to see your ranking
   - See final results and statistics at the end

## Deployment

This project can be deployed on Vercel:

```bash
npm install -g vercel
vercel --prod
```

## License

MIT

## Acknowledgments

- Built with React, TypeScript, and Socket.io
- UI components powered by ShadCN UI
