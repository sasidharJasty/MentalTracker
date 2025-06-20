import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useAuth } from '../context/AuthContext';

export default function EmotionTrends() {
  const chartRef = useRef(null);
  const legendRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'all'
  
  // Use a fallback approach to handle potential auth issues
  const [auth, setAuth] = useState({
    userStorage: {
      getItem: key => localStorage.getItem(key)
    }
  });
  
  // Try to get the real auth context
  useEffect(() => {
    try {
      const authContext = useAuth();
      if (authContext) {
        setAuth(authContext);
      }
    } catch (error) {
      console.error("Error using auth context in EmotionTrends:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = () => {
      try {
        const entries = JSON.parse(auth.userStorage.getItem('journalEntries')) || [];
        
        // Filter entries with emotion scores and timestamps
        const validEntries = entries.filter(
          entry => entry.emotionScores && entry.timestamp
        );
        
        // Filter by time range
        const filteredEntries = filterEntriesByTimeRange(validEntries, timeRange);
        
        // Sort by timestamp
        const sortedEntries = [...filteredEntries].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        setData(sortedEntries);
      } catch (error) {
        console.error('Error loading emotion data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Listen for updates to entries
    const handleJournalUpdated = () => {
      loadData();
    };
    
    window.addEventListener('journalUpdated', handleJournalUpdated);
    
    return () => {
      window.removeEventListener('journalUpdated', handleJournalUpdated);
    };
  }, [auth.userStorage, timeRange]);

  const filterEntriesByTimeRange = (entries, range) => {
    const now = new Date();
    let cutoffDate;
    
    switch (range) {
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        cutoffDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'all':
      default:
        return entries;
    }
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= cutoffDate;
    });
  };

  useEffect(() => {
    if (data.length === 0 || !chartRef.current || !legendRef.current) return;
    
    renderChart();
  }, [data]);

  const renderChart = () => {
    // Clear existing chart
    d3.select(chartRef.current).selectAll('*').remove();
    d3.select(legendRef.current).selectAll('*').remove();
    
    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Extract dates and emotions
    const dates = data.map(d => new Date(d.timestamp));
    const emotions = ['happiness', 'sadness', 'joy', 'anxiety', 'anger', 'calm'];
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(dates))
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);
    
    // Create color scale
    const colorScale = d3.scaleOrdinal()
      .domain(emotions)
      .range(['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#F44336', '#03A9F4']);
    
    // Create line generator
    const line = d3.line()
      .x(d => xScale(new Date(d.timestamp)))
      .y(d => yScale(d.score))
      .curve(d3.curveMonotoneX);
    
    // Create lines for each emotion
    emotions.forEach(emotion => {
      const emotionData = data.map(d => ({
        timestamp: d.timestamp,
        score: d.emotionScores[emotion] || 0
      }));
      
      svg.append('path')
        .datum(emotionData)
        .attr('fill', 'none')
        .attr('stroke', colorScale(emotion))
        .attr('stroke-width', 2)
        .attr('d', line);
    });
    
    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d3.timeFormat('%b %d')));
    
    svg.append('g')
      .call(d3.axisLeft(yScale));
    
    // Add axis labels
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${width/2},${height + 40})`)
      .text('Date')
      .attr('fill', '#666');
    
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(-35,${height/2}) rotate(-90)`)
      .text('Emotion Intensity')
      .attr('fill', '#666');
    
    // Create legend
    const legend = d3.select(legendRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', 30)
      .append('g')
      .attr('transform', 'translate(0,0)');
    
    const legendWidth = width / emotions.length;
    
    emotions.forEach((emotion, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${i * legendWidth},0)`);
      
      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', colorScale(emotion));
      
      legendItem.append('text')
        .attr('x', 16)
        .attr('y', 9)
        .attr('font-size', '10px')
        .text(emotion);
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-200 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-600">📊 Emotion Trends</h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded py-1 px-2 text-sm"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No emotion data available for the selected time period.</p>
          <p className="mt-2 text-sm">Write journal entries to start tracking your emotions.</p>
        </div>
      ) : (
        <>
          <div ref={chartRef} className="w-full" style={{ height: '400px' }}></div>
          <div ref={legendRef} className="mt-4 flex justify-center"></div>
        </>
      )}
    </div>
  );
}