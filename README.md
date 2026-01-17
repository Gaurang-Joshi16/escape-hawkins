# Escape Hawkins - Round 1 Platform

A production-grade, anti-cheat web platform for a competitive, time-bound, round-based elimination event inspired by Stranger Things.

## 🎯 Features

- **Team-Based Authentication**: Secure team login using Supabase Auth
- **5 Levels**: Progressive difficulty with Level 1 fully implemented, Levels 2-5 scaffolded
- **Anti-Cheat System**: Tab detection, reload prevention, copy/paste blocking, violation logging
- **Timer System**: Server-validated timers to prevent manipulation
- **Letter Collection**: Unlock letters by clearing levels to form the final word
- **Final Word Validation**: Submit the final word to qualify for Round 2
- **Stranger Things Theme**: VHS effects, glitch animations, neon aesthetics
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Routing**: React Router v7
- **State Management**: Context API
- **Backend**: Supabase (Auth + Database)
- **Styling**: Custom CSS with animations

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Modern web browser

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Supabase Database

Create the following tables in your Supabase project:

#### `round1_scores` Table

```sql
CREATE TABLE round1_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id TEXT NOT NULL,
  level INTEGER NOT NULL,
  score INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  cleared BOOLEAN NOT NULL,
  letters_unlocked TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_round1_scores_team_id ON round1_scores(team_id);
CREATE INDEX idx_round1_scores_level ON round1_scores(level);
```

#### `round2_qualification` Table

```sql
CREATE TABLE round2_qualification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id TEXT NOT NULL UNIQUE,
  final_word TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  qualified BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_round2_qualification_team_id ON round2_qualification(team_id);
```

#### `anti_cheat_logs` Table

```sql
CREATE TABLE anti_cheat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id TEXT NOT NULL,
  violation_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Add index
CREATE INDEX idx_anti_cheat_logs_team_id ON anti_cheat_logs(team_id);
CREATE INDEX idx_anti_cheat_logs_timestamp ON anti_cheat_logs(timestamp);
```

### 4. Configure Row Level Security (RLS)

Enable RLS on all tables and add policies:

```sql
-- Enable RLS
ALTER TABLE round1_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE round2_qualification ENABLE ROW LEVEL SECURITY;
ALTER TABLE anti_cheat_logs ENABLE ROW LEVEL SECURITY;

-- Policies for round1_scores
CREATE POLICY "Teams can insert their own scores"
  ON round1_scores FOR INSERT
  WITH CHECK (auth.jwt() ->> 'team_id' = team_id);

CREATE POLICY "Teams can view their own scores"
  ON round1_scores FOR SELECT
  USING (auth.jwt() ->> 'team_id' = team_id);

-- Policies for round2_qualification
CREATE POLICY "Teams can insert their own qualification"
  ON round2_qualification FOR INSERT
  WITH CHECK (auth.jwt() ->> 'team_id' = team_id);

CREATE POLICY "Teams can view their own qualification"
  ON round2_qualification FOR SELECT
  USING (auth.jwt() ->> 'team_id' = team_id);

-- Policies for anti_cheat_logs
CREATE POLICY "Teams can insert their own logs"
  ON anti_cheat_logs FOR INSERT
  WITH CHECK (auth.jwt() ->> 'team_id' = team_id);

CREATE POLICY "Teams can view their own logs"
  ON anti_cheat_logs FOR SELECT
  USING (auth.jwt() ->> 'team_id' = team_id);
```

### 5. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
escape-hawkins/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Loader.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── QuestionCard.jsx
│   │   ├── Timer.jsx
│   │   ├── LetterReveal.jsx
│   │   ├── FinalWordInput.jsx
│   │   └── ScoreDisplay.jsx
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── GameContext.jsx
│   │   └── AntiCheatContext.jsx
│   ├── data/              # Question data and configuration
│   │   ├── level1Questions.js
│   │   └── levelsConfig.js
│   ├── hooks/             # Custom React hooks
│   │   ├── useTimer.js
│   │   └── useQuestion.js
│   ├── pages/             # Page components
│   │   ├── Login.jsx
│   │   ├── Round1Dashboard.jsx
│   │   ├── Level1.jsx
│   │   ├── Level2.jsx (scaffolded)
│   │   ├── Level3.jsx (scaffolded)
│   │   ├── Level4.jsx (scaffolded)
│   │   ├── Level5.jsx (scaffolded)
│   │   └── FinalWord.jsx
│   ├── services/          # API and service layer
│   │   ├── supabaseClient.js
│   │   ├── authService.js
│   │   ├── gameService.js
│   │   └── antiCheatService.js
│   ├── styles/            # CSS stylesheets
│   │   ├── index.css
│   │   ├── Loader.css
│   │   ├── Login.css
│   │   ├── Timer.css
│   │   ├── QuestionCard.css
│   │   ├── LetterReveal.css
│   │   ├── Round1Dashboard.css
│   │   └── ...
│   ├── utils/             # Utility functions
│   │   ├── antiCheat.js
│   │   ├── timerValidation.js
│   │   └── storage.js
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

## 🎮 How to Play

1. **Login**: Enter your Team ID to authenticate
2. **Dashboard**: View all 5 levels and your progress
3. **Level 1**: Answer 5 questions (need 3+ correct to clear)
4. **Letters**: Collect letters by clearing levels
5. **Levels 2-5**: Currently scaffolded (coming soon)
6. **Final Word**: Submit the final word after clearing all levels
7. **Round 2**: Qualify for Round 2 with correct final word

## 🔐 Anti-Cheat Features

- **Tab Switch Detection**: Logs when user switches tabs
- **Page Reload Prevention**: Warns before reload
- **Back Navigation Blocking**: Prevents browser back button
- **Copy/Paste Prevention**: Disables copy/paste operations
- **Timer Validation**: Server-side time validation
- **Violation Logging**: All violations logged to Supabase

## 🎨 Customization

### Adding New Levels (2-5)

1. Create `src/data/level[X]Questions.js` with 5 questions
2. Copy structure from `level1Questions.js`
3. Update `src/data/levelsConfig.js`:
   - Set `isLocked: false` for the level
   - Update `lettersToUnlock` to match your final word
4. Copy `src/pages/Level1.jsx` to `Level[X].jsx`
5. Update level number and question imports
6. Test the level flow

### Changing the Final Word

Edit `src/data/levelsConfig.js`:

```javascript
export const FINAL_WORD_CONFIG = {
  word: 'YOUR_WORD',  // Change this
  hint: 'Your hint',
  description: 'Your description'
};
```

Update `lettersToUnlock` in each level to match the letters in your word.

### Customizing Questions

Edit `src/data/level1Questions.js`:

```javascript
{
  id: 'unique_id',
  type: 'MCQ' | 'TEXT' | 'LOGIC',
  question: 'Your question',
  options: ['A', 'B', 'C', 'D'],  // For MCQ only
  correctAnswer: 'Correct answer',
  timeLimit: 30,  // seconds
  points: 10
}
```

## 🐛 Troubleshooting

### Supabase Connection Issues

- Verify `.env` file exists and has correct credentials
- Check Supabase project is active
- Ensure RLS policies are configured correctly

### Authentication Fails

- Check Supabase Auth settings
- Verify anonymous sign-in is enabled
- Check browser console for errors

### Timer Not Working

- Ensure server timestamp function exists in Supabase
- Check network connectivity
- Verify timer validation logic

## 📝 License

This project is for the Escape Hawkins event. All rights reserved.

## 🤝 Contributing

This is an event-specific project. For issues or suggestions, contact the event organizers.

## 📧 Support

For technical support, contact the development team.

---

**Built with ❤️ for Escape Hawkins**
