// File: src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#14b8a6'];

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [hasEmotionData, setHasEmotionData] = useState(false);
  const [stats, setStats] = useState({
    totalEntries: 0,
    recentEntries: 0,
    dominantEmotions: {},
    moodTrend: 'neutral'
  });
  const [loading, setLoading] = useState(true);
  const { userStorage, currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const calculateStats = () => {
      try {
        const stored = JSON.parse(userStorage.getItem('journalEntries')) || [];
        const filtered = stored.filter(e => e.emotionScores && e.dominantEmotion);
        setEntries(filtered);
        setHasEmotionData(filtered.length > 0);

        // Log to console for debugging
        console.log("Total entries:", stored.length);
        console.log("Entries with emotion data:", filtered.length);

        // Skip calculation if no entries
        if (stored.length === 0) {
          setStats({
            totalEntries: 0,
            recentEntries: 0,
            dominantEmotions: {},
            moodTrend: 'neutral'
          });
          setLoading(false);
          return;
        }

        // Count total entries
        const totalEntries = stored.length;

        // Count entries in the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentEntries = stored.filter(entry => {
          if (!entry.timestamp) return false;
          const entryDate = new Date(entry.timestamp);
          return entryDate >= oneWeekAgo;
        }).length;

        // Count dominant emotions
        const dominantEmotions = {};
        stored.forEach(entry => {
          if (entry.dominantEmotion) {
            dominantEmotions[entry.dominantEmotion] = (dominantEmotions[entry.dominantEmotion] || 0) + 1;
          }
        });

        // Calculate mood trend
        const recentEmotionScores = stored
          .slice(-5) // Get 5 most recent entries
          .filter(entry => entry.emotionScores)
          .map(entry => entry.emotionScores);

        let moodTrend = 'neutral';

        if (recentEmotionScores.length >= 3) {
          // Calculate average happiness and sadness
          const avgHappiness = recentEmotionScores.reduce((sum, scores) =>
            sum + (scores.happiness || 0), 0) / recentEmotionScores.length;

          const avgSadness = recentEmotionScores.reduce((sum, scores) =>
            sum + (scores.sadness || 0), 0) / recentEmotionScores.length;

          if (avgHappiness > 0.6) {
            moodTrend = 'positive';
          } else if (avgSadness > 0.6) {
            moodTrend = 'negative';
          } else {
            moodTrend = 'neutral';
          }
        }

        setStats({
          totalEntries,
          recentEntries,
          dominantEmotions,
          moodTrend
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();

    // Listen for updates to entries
    const handleJournalUpdated = () => {
      calculateStats();
    };

    window.addEventListener('journalUpdated', handleJournalUpdated);

    return () => {
      window.removeEventListener('journalUpdated', handleJournalUpdated);
    };
  }, [userStorage, currentUser]);

  const pieData = entries.length > 0 ? Object.entries(
    entries.reduce((acc, curr) => {
      if (curr.dominantEmotion) {
        acc[curr.dominantEmotion] = (acc[curr.dominantEmotion] || 0) + 1;
      }
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })) : [];

  const timelineData = entries.length > 0 ? entries.map(e => ({
    time: e.timestamp,
    ...(e.emotionScores || {})
  })).reverse() : [];

  return (
    <div className="bg-white p-6 my-10 rounded-xl shadow-xl border border-pink-200">
      <h2 className="text-3xl font-bold text-pink-700 mb-4">📈 Mood Overview</h2>

      {!hasEmotionData ? (
        <p className="text-pink-600">No emotion data available yet. Start by writing a journal entry with detailed emotions.</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-pink-600 mb-2">📊 Mood Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-pink-600 mb-2">📅 Emotion Timeline</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timelineData}>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  {['happiness', 'sadness', 'joy', 'anxiety', 'anger', 'calm'].map((emotion, idx) => (
                    <Line
                      key={emotion}
                      type="monotone"
                      dataKey={emotion}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold text-pink-600 mb-2">📋 Entry Emotion Bars</h3>
            {entries.map(entry => (
              <div key={entry.id} className="mb-6">
                <p className="font-semibold text-pink-600 mb-1">{entry.timestamp}</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart
                    layout="vertical"
                    data={Object.entries(entry.emotionScores || {}).map(([k, v]) => ({ name: k, value: v }))}
                  >
                    <XAxis type="number" domain={[0, 1]} hide />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ec4899">
                      <LabelList dataKey="value" position="right" formatter={(v) => `${Math.round(v * 100)}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
