import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useAuth } from '../context/AuthContext';

export default function MemoryGraph() {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [hasData, setHasData] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [clusterBy, setClusterBy] = useState('emotion'); // 'emotion', 'time', 'none'
  const { userStorage } = useAuth(); // Get user-specific storage

  // Use separate effect for data loading and determining if we have data
  useEffect(() => {
    const data = JSON.parse(userStorage.getItem('journalEntries')) || [];
    console.log("Memory Graph data loaded:", data.length, "entries");
    
    const nodesData = data.filter((d) => d.dominantEmotion);
    console.log("Entries with emotion data:", nodesData.length);
    
    setHasData(nodesData.length > 0);
  }, [userStorage]);

  // Memoize renderGraph to avoid recreating it on each render
  const renderGraph = useCallback(() => {
    if (!svgRef.current) return;
    
    const data = JSON.parse(userStorage.getItem('journalEntries')) || [];
    const nodesData = data.filter((d) => d.dominantEmotion);
    
    if (nodesData.length === 0) return;
    
    try {
      const svg = d3.select(svgRef.current);
      
      // Clear any existing content
      svg.selectAll('*').remove();

      // Create nodes with more properties for better visualization
      const nodes = nodesData.map((d) => ({
        id: d.id.toString(),
        group: d.dominantEmotion,
        label: d.dominantEmotion,
        value: d.emotionScores ? d.emotionScores[d.dominantEmotion.toLowerCase()] || 0.5 : 0.5,
        timestamp: d.timestamp,
        summary: d.summary,
        text: d.text,
        mood: d.mood,
        emotionScores: d.emotionScores || {},
        // Extract the date part only for grouping by time period
        dateGroup: d.timestamp ? new Date(d.timestamp).toLocaleDateString() : 'unknown'
      }));
      
      console.log("Created", nodes.length, "nodes for graph");

      // Create links based on clustering strategy
      let links = [];
      
      if (clusterBy === 'emotion') {
        // Group by emotion - create links between nodes with the same emotion
        const emotionGroups = {};
        
        nodes.forEach(node => {
          if (!emotionGroups[node.group]) {
            emotionGroups[node.group] = [];
          }
          emotionGroups[node.group].push(node);
        });
        
        // Create links within emotion groups
        Object.values(emotionGroups).forEach(group => {
          if (group.length > 1) {
            for (let i = 0; i < group.length; i++) {
              for (let j = i + 1; j < group.length; j++) {
                links.push({
                  source: group[i].id,
                  target: group[j].id,
                  value: 1,
                  type: 'emotion'
                });
              }
            }
          }
        });
      } else if (clusterBy === 'time') {
        // Group by time period - create links between entries from the same day
        const dateGroups = {};
        
        nodes.forEach(node => {
          if (!dateGroups[node.dateGroup]) {
            dateGroups[node.dateGroup] = [];
          }
          dateGroups[node.dateGroup].push(node);
        });
        
        // Create links within date groups
        Object.values(dateGroups).forEach(group => {
          if (group.length > 1) {
            for (let i = 0; i < group.length; i++) {
              for (let j = i + 1; j < group.length; j++) {
                links.push({
                  source: group[i].id,
                  target: group[j].id,
                  value: 1,
                  type: 'time'
                });
              }
            }
          }
        });
      } else {
        // Chronological links
        if (nodes.length > 1) {
          // Sort nodes by timestamp (if available) or by ID
          const sortedNodes = [...nodes].sort((a, b) => {
            if (a.timestamp && b.timestamp) {
              return new Date(a.timestamp) - new Date(b.timestamp);
            }
            return parseInt(a.id) - parseInt(b.id);
          });
          
          // Create links between consecutive entries
          for (let i = 0; i < sortedNodes.length - 1; i++) {
            links.push({
              source: sortedNodes[i].id,
              target: sortedNodes[i + 1].id,
              value: 1,
              type: 'chronological'
            });
          }
        }
      }

      // Get the actual width of the SVG element
      const containerWidth = svgRef.current.parentElement.clientWidth || 600;
      const width = Math.min(containerWidth, 600);
      const height = 400;
      
      svg.attr('viewBox', `0 0 ${width} ${height}`);

      // Color scale for different emotions
      const emotionColors = {
        "happiness": "#4CAF50", // green
        "joy": "#FFC107",       // amber
        "sadness": "#2196F3",   // blue
        "anxiety": "#9C27B0",   // purple
        "anger": "#F44336",     // red
        "calm": "#03A9F4",      // light blue
        "fear": "#FF5722",      // deep orange
        "surprise": "#FFEB3B",  // yellow
        "disgust": "#795548",   // brown
        "neutral": "#9E9E9E"    // grey
      };
      
      // Default color function
      const getNodeColor = (d) => {
        const emotion = (d.group || "").toLowerCase();
        return emotionColors[emotion] || "#EC4899"; // Default to pink if no match
      };

      // Create simulation with appropriate forces based on clustering strategy
      const simulation = d3
        .forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(d => 
          clusterBy === 'emotion' ? (d.type === 'emotion' ? 50 : 200) : 
          clusterBy === 'time' ? (d.type === 'time' ? 50 : 200) : 
          100
        ))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => Math.max(20, d.value * 25)))
        .force('x', d3.forceX(width / 2).strength(0.1))
        .force('y', d3.forceY(height / 2).strength(0.1));

      // If clustering by emotion, add cluster forces
      if (clusterBy === 'emotion') {
        // Create emotion-based clustering forces
        const emotionGroups = {};
        nodes.forEach(node => {
          if (!emotionGroups[node.group]) {
            emotionGroups[node.group] = [];
          }
          emotionGroups[node.group].push(node);
        });
        
        // Create cluster centers around the perimeter
        const emotionCenters = {};
        const emotions = Object.keys(emotionGroups);
        
        emotions.forEach((emotion, i) => {
          const angle = (i / emotions.length) * 2 * Math.PI;
          const radius = Math.min(width, height) * 0.4;
          emotionCenters[emotion] = {
            x: width/2 + radius * Math.cos(angle),
            y: height/2 + radius * Math.sin(angle)
          };
        });
        
        // Add forces to pull each emotion group to its center
        simulation.force('cluster', d3.forceRadial(
          d => 0,
          d => emotionCenters[d.group]?.x || width/2,
          d => emotionCenters[d.group]?.y || height/2
        ).strength(0.8));
      }

      // Create links with different styles based on type
      const link = svg
        .append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', d => 
          d.type === 'emotion' ? '#ffccdc' : 
          d.type === 'time' ? '#c8e6c9' : 
          '#ddd'
        )
        .attr('stroke-width', d => 
          d.type === 'emotion' ? 3 : 
          d.type === 'time' ? 2 : 
          1
        )
        .attr('stroke-opacity', 0.6)
        .attr('stroke-dasharray', d => 
          d.type === 'emotion' ? '0' : 
          d.type === 'time' ? '3,3' : 
          '5,5'
        );

      // Create node groups with enhanced styling
      const nodeGroup = svg
        .append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('class', 'node-group')
        .on('click', (event, d) => {
          event.stopPropagation();
          setSelectedNode(d);
        });

      // Add glowing effect for node backgrounds
      nodeGroup
        .append('circle')
        .attr('r', d => Math.max(15, d.value * 25) + 5)
        .attr('fill', d => getNodeColor(d))
        .attr('opacity', 0.2)
        .attr('class', 'node-glow');

      // Add main circle for each node
      nodeGroup
        .append('circle')
        .attr('r', d => Math.max(15, d.value * 25))
        .attr('fill', d => getNodeColor(d))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('class', 'node-circle');

      // Add emotional icon based on dominant emotion
      nodeGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', d => Math.max(10, d.value * 20))
        .attr('fill', '#fff')
        .attr('pointer-events', 'none')
        .text(d => {
          const emotionIcons = {
            'happiness': '😊',
            'joy': '😄',
            'sadness': '😢',
            'anxiety': '😰',
            'anger': '😠',
            'calm': '😌',
            'fear': '😨',
            'surprise': '😲',
            'disgust': '🤢',
            'neutral': '😐'
          };
          return emotionIcons[d.group.toLowerCase()] || '🧠';
        });

      // Add labels
      nodeGroup
        .append('text')
        .text(d => d.label)
        .attr('font-size', 10)
        .attr('dx', 0)
        .attr('dy', d => -Math.max(15, d.value * 25) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#333')
        .attr('class', 'node-label')
        .style('pointer-events', 'none');
        
      // Add drag behavior
      nodeGroup.call(
        d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

      // Update positions on simulation tick
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
      });

      // Drag functions
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      
      // Add click handler to background to deselect node
      svg.on('click', () => {
        setSelectedNode(null);
      });
      
    } catch (error) {
      console.error("Error rendering memory graph:", error);
    }
  }, [clusterBy, setSelectedNode, userStorage]);

  // Separate effect for D3 rendering that only runs when the component is fully mounted
  useEffect(() => {
    // Wait for next tick to ensure the SVG is mounted
    const timeoutId = setTimeout(() => {
      if (!hasData) {
        console.log("No data to display in graph");
        return;
      }

      if (!svgRef.current) {
        console.log("SVG element not yet available, skipping render");
        return;
      }

      renderGraph();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [hasData, renderGraph]);

  // Listen for changes to journal entries
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only react to changes in the current user's data
      if (e.key === `${userStorage.userId}_journalEntries`) {
        console.log("Storage changed, refreshing graph");
        
        // Update hasData state
        const data = JSON.parse(userStorage.getItem('journalEntries')) || [];
        const nodesData = data.filter((d) => d.dominantEmotion);
        setHasData(nodesData.length > 0);
        
        // Re-render the graph
        if (nodesData.length > 0) {
          renderGraph();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from other components
    const handleCustomEvent = () => {
      // Similar to above, update data and re-render
      const data = JSON.parse(userStorage.getItem('journalEntries')) || [];
      const nodesData = data.filter((d) => d.dominantEmotion);
      setHasData(nodesData.length > 0);
      
      if (nodesData.length > 0) {
        renderGraph();
      }
    };
    
    window.addEventListener('journalUpdated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('journalUpdated', handleCustomEvent);
    };
  }, [renderGraph, userStorage]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-200 my-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-pink-600">🧠 Memory Map</h2>
        
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-500">Group by:</span>
          <select 
            value={clusterBy} 
            onChange={(e) => setClusterBy(e.target.value)}
            className="px-2 py-1 text-sm border border-pink-200 rounded-lg bg-pink-50"
          >
            <option value="emotion">Emotion</option>
            <option value="time">Time</option>
            <option value="none">Chronological</option>
          </select>
        </div>
      </div>
      
      {!hasData ? (
        <p className="text-pink-500 p-4">No memory data available yet. Write journal entries to see your emotional connections.</p>
      ) : (
        <div className="relative" style={{ minHeight: "400px" }}>
          <svg 
            ref={svgRef} 
            width="100%" 
            height="400" 
            className="border border-pink-100 rounded-lg bg-pink-50/30"
          ></svg>
          <div className="text-xs text-gray-500 mt-2 flex gap-4">
            <p>💡 Click on a node to see details</p>
            <p>🔄 Change grouping to explore different connections</p>
            <p>🖱️ Drag nodes to rearrange</p>
          </div>
          
          {selectedNode && (
            <div className="absolute top-2 right-2 w-64 bg-white border-2 border-pink-300 shadow-lg rounded-lg p-3 text-sm">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-pink-700">{selectedNode.group}</h3>
                <button 
                  onClick={() => setSelectedNode(null)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-gray-500 italic mb-2">{selectedNode.timestamp}</p>
              
              <div className="border-t border-pink-100 my-2 pt-2">
                <p className="font-semibold text-gray-700">Mood: {selectedNode.mood}</p>
                <p className="text-gray-600 text-xs mt-1">{selectedNode.summary}</p>
                
                {selectedNode.emotionScores && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-600">Emotion Scores:</p>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {Object.entries(selectedNode.emotionScores).map(([emotion, score]) => (
                        <div key={emotion} className="flex items-center">
                          <div className="w-1 h-4 rounded-sm" style={{
                            backgroundColor: 
                              emotion === 'happiness' ? "#4CAF50" :
                              emotion === 'joy' ? "#FFC107" :
                              emotion === 'sadness' ? "#2196F3" :
                              emotion === 'anxiety' ? "#9C27B0" :
                              emotion === 'anger' ? "#F44336" :
                              emotion === 'calm' ? "#03A9F4" :
                              "#9E9E9E"
                          }}></div>
                          <span className="text-xs ml-1">{emotion}: {Math.round(score * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
