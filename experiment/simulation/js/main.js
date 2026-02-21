// Initialize theme (default: light)
document.documentElement.setAttribute('data-theme', 'light');

// Toggle Theme
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  document.getElementById('themeIcon').textContent = newTheme === 'light' ? '☀️' : '🌙';
  
  if (state.graph.nodes.length > 0) {
    renderGraph();
  }
}

// State Management
const state = {
  graph: { nodes: [], edges: [] },
  residualGraph: new Map(),
  currentPath: [],
  maxFlow: 0,
  pathCount: 0,
  initialized: false,
  running: false,
  autoInterval: null,
  showFlow: true,
  startTime: 0,
  stepState: null,
  currentStep: 1
};

// Preset Graphs
const presets = {
  simple: {
    nodes: ['s', 'a', 'b', 't'],
    edges: [
      { u: 's', v: 'a', c: 10 },
      { u: 's', v: 'b', c: 5 },
      { u: 'a', v: 't', c: 10 },
      { u: 'b', v: 't', c: 10 }
    ]
  },
  medium: {
    nodes: ['s', 'a', 'b', 'c', 'd', 't'],
    edges: [
      { u: 's', v: 'a', c: 16 },
      { u: 's', v: 'c', c: 13 },
      { u: 'a', v: 'b', c: 12 },
      { u: 'b', v: 'c', c: 9 },
      { u: 'b', v: 't', c: 20 },
      { u: 'c', v: 'd', c: 14 },
      { u: 'd', v: 'b', c: 7 },
      { u: 'd', v: 't', c: 4 }
    ]
  },
  complex: {
    nodes: ['s', 'a', 'b', 'c', 'd', 'e', 'f', 't'],
    edges: [
      { u: 's', v: 'a', c: 10 },
      { u: 's', v: 'b', c: 10 },
      { u: 'a', v: 'c', c: 4 },
      { u: 'a', v: 'd', c: 8 },
      { u: 'b', v: 'd', c: 9 },
      { u: 'c', v: 'e', c: 6 },
      { u: 'd', v: 'e', c: 10 },
      { u: 'd', v: 'f', c: 10 },
      { u: 'e', v: 't', c: 10 },
      { u: 'f', v: 't', c: 10 }
    ]
  },
  dense: {
    nodes: ['s', 'a', 'b', 'c', 'd', 't'],
    edges: [
      { u: 's', v: 'a', c: 7 },
      { u: 's', v: 'b', c: 4 },
      { u: 's', v: 'c', c: 5 },
      { u: 'a', v: 'b', c: 3 },
      { u: 'a', v: 'd', c: 8 },
      { u: 'b', v: 'c', c: 2 },
      { u: 'b', v: 'd', c: 5 },
      { u: 'c', v: 'd', c: 6 },
      { u: 'c', v: 't', c: 9 },
      { u: 'd', v: 't', c: 12 }
    ]
  }
};

// Helper: Convert graph data to all 3 formats
function graphToFormats(data) {
  // Simple format
  const simple = data.edges.map(e => `${e.u}->${e.v}:${e.c}`).join(', ');
  
  // JSON format
  const json = JSON.stringify(data, null, 2);
  
  // Matrix format
  const nodeMap = {};
  data.nodes.forEach((node, idx) => nodeMap[node] = idx);
  const n = data.nodes.length;
  const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
  
  data.edges.forEach(e => {
    const i = nodeMap[e.u];
    const j = nodeMap[e.v];
    matrix[i][j] = e.c;
  });
  
  const matrixStr = matrix.map(row => row.join(' ')).join('\n');
  
  return { simple, json, matrixStr };
}

// Load Preset - FIXED: Populate all 3 input tabs
function loadPreset(name) {
  const preset = presets[name];
  if (!preset) return;
  
  // Update active button
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Get all 3 formats
  const formats = graphToFormats(preset);
  
  // Fill all 3 input fields
  document.getElementById('simpleText').value = formats.simple;
  document.getElementById('jsonText').value = formats.json;
  document.getElementById('matrixText').value = formats.matrixStr;
  
  // REMOVED: loadGraph(preset);
  showToast(`Preset loaded - Click "Load Graph" to visualize`, 'info');
}

// Generate Random Graph
function generateRandom() {
  const nodeCount = parseInt(document.getElementById('randomNodes').value);
  const densityPercent = parseInt(document.getElementById('randomDensity').value);
  
  const nodes = ['s'];
  for (let i = 1; i < nodeCount - 1; i++) {
    nodes.push(String.fromCharCode(97 + i - 1));
  }
  nodes.push('t');
  
  const edges = [];
  const maxEdges = nodeCount * (nodeCount - 1) / 2;
  const targetEdges = Math.floor(maxEdges * densityPercent / 100);
  
  // Ensure connectivity
  for (let i = 0; i < nodeCount - 1; i++) {
    edges.push({
      u: nodes[i],
      v: nodes[i + 1],
      c: Math.floor(Math.random() * 15) + 5
    });
  }
  
  // Add random edges
  while (edges.length < targetEdges) {
    const u = Math.floor(Math.random() * (nodeCount - 1));
    const v = u + 1 + Math.floor(Math.random() * (nodeCount - u - 1));
    const exists = edges.some(e => e.u === nodes[u] && e.v === nodes[v]);
    
    if (!exists) {
      edges.push({
        u: nodes[u],
        v: nodes[v],
        c: Math.floor(Math.random() * 15) + 5
      });
    }
  }
  
  const graphData = { nodes, edges };
  
  // Fill all 3 input fields
  const formats = graphToFormats(graphData);
  document.getElementById('simpleText').value = formats.simple;
  document.getElementById('jsonText').value = formats.json;
  document.getElementById('matrixText').value = formats.matrixStr;
  
  //Removed!!! loadGraph(graphData);
  showToast('Random graph generated - Click "Load Graph" to visualize', 'info');
}

// Switch Input Tab
function switchInputTab(tab) {
  document.querySelectorAll('.input-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.input-content').forEach(c => c.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(tab + 'Input').classList.add('active');
}

// Load Custom Graph - FIXED: Better error handling
function loadCustomGraph() {
  try {
    const activeTab = document.querySelector('.input-tab.active').textContent.trim();
    let graphData;
    
    if (activeTab === 'Simple') {
      const text = document.getElementById('simpleText').value.trim();
      if (!text) {
        throw new Error('Please enter graph data');
      }
      graphData = parseSimpleFormat(text);
    } else if (activeTab === 'JSON') {
      const json = document.getElementById('jsonText').value.trim();
      if (!json) {
        throw new Error('Please enter JSON data');
      }
      graphData = JSON.parse(json);
      if (!graphData.nodes || !graphData.edges) {
        throw new Error('JSON must have "nodes" and "edges" fields');
      }
      graphData.edges = graphData.edges.map(e => ({
        u: e.u,
        v: e.v,
        c: e.c || e.capacity
      }));
    } else if (activeTab === 'Matrix') {
      const matrix = document.getElementById('matrixText').value.trim();
      if (!matrix) {
        throw new Error('Please enter matrix data');
      }
      graphData = parseMatrixFormat(matrix);
    }
    
    loadGraph(graphData);
    showToast('Custom graph loaded', 'success');
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
    addLog('Error loading graph: ' + error.message, 'error');
  }
}

// Parse Simple Format
function parseSimpleFormat(text) {
  const edges = [];
  const nodeSet = new Set();
  
  const parts = text.split(/[,\n]+/).map(s => s.trim()).filter(s => s);
  
  for (const part of parts) {
    const match = part.match(/(\w+)\s*->\s*(\w+)\s*:\s*(\d+)/);
    if (!match) throw new Error(`Invalid format: "${part}". Use format: u->v:capacity`);
    
    const [_, u, v, c] = match;
    edges.push({ u, v, c: parseInt(c) });
    nodeSet.add(u);
    nodeSet.add(v);
  }
  
  const nodes = Array.from(nodeSet);
  if (nodes.includes('s') && nodes.includes('t')) {
    nodes.sort((a, b) => {
      if (a === 's') return -1;
      if (b === 's') return 1;
      if (a === 't') return 1;
      if (b === 't') return -1;
      return a.localeCompare(b);
    });
  }
  
  return { nodes, edges };
}

// Parse Matrix Format
function parseMatrixFormat(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const matrix = lines.map(line => line.split(/\s+/).map(Number));
  
  const n = matrix.length;
  const nodes = ['s'];
  for (let i = 1; i < n - 1; i++) {
    nodes.push(String.fromCharCode(97 + i - 1));
  }
  nodes.push('t');
  
  const edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] > 0) {
        edges.push({
          u: nodes[i],
          v: nodes[j],
          c: matrix[i][j]
        });
      }
    }
  }
  
  return { nodes, edges };
}

// Load Graph
function loadGraph(data) {
  state.graph = {
    nodes: data.nodes.map((id, idx) => ({
      id,
      x: 0,
      y: 0
    })),
    edges: data.edges.map((e, idx) => ({
      id: idx,
      u: e.u,
      v: e.v,
      capacity: e.c,
      flow: 0
    }))
  };
  
  positionNodes();
  renderGraph();
  reset();
  document.getElementById('initBtn').disabled = false;
  addLog('Graph loaded successfully', 'success');
}

// Position Nodes
function positionNodes() {
  const canvas = document.getElementById('canvas');
  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 600;
  const padding = 80;
  
  const nodes = state.graph.nodes;
  const n = nodes.length;
  
  if (n === 0) return;
  
  nodes[0].x = padding;
  nodes[0].y = height / 2;
  
  nodes[n - 1].x = width - padding;
  nodes[n - 1].y = height / 2;
  
  const intermediate = nodes.slice(1, n - 1);
  const layers = Math.ceil(Math.sqrt(intermediate.length));
  const layerWidth = (width - 2 * padding) / (layers + 1);
  
  intermediate.forEach((node, idx) => {
    const layer = Math.floor(idx / Math.ceil(intermediate.length / layers));
    const posInLayer = idx % Math.ceil(intermediate.length / layers);
    const nodesInLayer = Math.min(
      Math.ceil(intermediate.length / layers),
      intermediate.length - layer * Math.ceil(intermediate.length / layers)
    );
    
    node.x = padding + (layer + 1) * layerWidth;
    node.y = padding + (posInLayer + 1) * (height - 2 * padding) / (nodesInLayer + 1);
  });
}

// Initialize Algorithm
function initialize() {
  if (state.graph.nodes.length === 0) {
    showToast('Please load a graph first', 'warning');
    return;
  }
  
  state.initialized = true;
  state.maxFlow = 0;
  state.pathCount = 0;
  state.startTime = Date.now();
  state.currentStep = 1;
  state.stepState = null;
  state.graph.edges.forEach(e => e.flow = 0);
  
  buildResidualGraph();
  
  document.getElementById('stepBtn').disabled = false;
  document.getElementById('autoBtn').disabled = false;
  document.getElementById('initBtn').disabled = true;
  
  updateStep(1);
  updateMetrics();
  renderGraph();
  addLog('Algorithm initialized', 'success');
  showToast('Algorithm ready', 'success');
}

// Build Residual Graph
function buildResidualGraph() {
  state.residualGraph = new Map();
  
  state.graph.nodes.forEach(node => {
    state.residualGraph.set(node.id, new Map());
  });
  
  state.graph.edges.forEach(edge => {
    const forward = state.residualGraph.get(edge.u);
    const backward = state.residualGraph.get(edge.v);
    
    forward.set(edge.v, edge.capacity - edge.flow);
    
    const currentBack = backward.get(edge.u) || 0;
    backward.set(edge.u, currentBack + edge.flow);
  });
}

// Find Augmenting Path
function findAugmentingPath() {
  const source = state.graph.nodes[0].id;
  const sink = state.graph.nodes[state.graph.nodes.length - 1].id;
  
  const visited = new Set([source]);
  const parent = new Map();
  const queue = [source];
  
  while (queue.length > 0) {
    const u = queue.shift();
    
    if (u === sink) {
      const path = [];
      let current = sink;
      while (current !== source) {
        path.unshift(current);
        current = parent.get(current);
      }
      path.unshift(source);
      return path;
    }
    
    const neighbors = state.residualGraph.get(u);
    if (neighbors) {
      for (const [v, residual] of neighbors) {
        if (!visited.has(v) && residual > 0) {
          visited.add(v);
          parent.set(v, u);
          queue.push(v);
        }
      }
    }
  }
  
  return null;
}

// Calculate Bottleneck
function calculateBottleneck(path) {
  let bottleneck = Infinity;
  
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    const residual = state.residualGraph.get(u).get(v);
    bottleneck = Math.min(bottleneck, residual);
  }
  
  return bottleneck;
}

// Augment Flow
function augmentFlow(path, bottleneck) {
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    
    const edge = state.graph.edges.find(e => e.u === u && e.v === v);
    
    if (edge) {
      edge.flow += bottleneck;
    } else {
      const backEdge = state.graph.edges.find(e => e.u === v && e.v === u);
      if (backEdge) {
        backEdge.flow -= bottleneck;
      }
    }
  }
  
  buildResidualGraph();
}

// Step Algorithm
function step() {
  if (!state.initialized) {
    showToast('Initialize first', 'warning');
    return;
  }
  
  if (state.stepState) {
    const { path, bottleneck } = state.stepState;
    
    updateStep(4);
    addLog(`Augmenting flow: ${bottleneck} units along ${path.join(' → ')}`, 'success');
    
    augmentFlow(path, bottleneck);
    state.maxFlow += bottleneck;
    state.pathCount++;
    
    addPathToTimeline(path, bottleneck);
    updateMetrics();
    renderGraph();
    
    state.stepState = null;
    state.currentStep = 2;
    
    return;
  }
  
  updateStep(2);
  addLog('Searching for augmenting path...', 'info');
  
  const path = findAugmentingPath();
  
  if (!path) {
    updateStep(5);
    addLog(`Algorithm complete! Maximum flow: ${state.maxFlow}`, 'success');
    showToast(`Maximum flow: ${state.maxFlow}`, 'success');
    
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('autoBtn').disabled = true;
    
    if (state.autoInterval) {
      clearInterval(state.autoInterval);
      state.autoInterval = null;
      state.running = false;
      document.getElementById('autoBtn').innerHTML = '⏩ Auto Run';
    }
    
    return;
  }
  
  updateStep(3);
  const bottleneck = calculateBottleneck(path);
  addLog(`Path found: ${path.join(' → ')} (bottleneck: ${bottleneck})`, 'info');
  
  state.currentPath = path;
  renderGraph();
  
  state.stepState = { path, bottleneck };
  state.currentStep = 4;
}

// Toggle Auto Run (faster, fixed speed)
function toggleAuto() {
  if (state.running) {
    clearInterval(state.autoInterval);
    state.autoInterval = null;
    state.running = false;
    document.getElementById('autoBtn').innerHTML = '⏩ Auto Run';
    document.getElementById('stepBtn').disabled = false;
    addLog('Auto-run stopped', 'warning');
  } else {
    state.running = true;
    document.getElementById('autoBtn').innerHTML = '⏸️ Pause';
    document.getElementById('stepBtn').disabled = true;
    addLog('Auto-run started', 'success');
    
    const delay = 800;
    
    state.autoInterval = setInterval(() => {
      step();
      
      if (document.getElementById('stepBtn').disabled && !state.running) {
        clearInterval(state.autoInterval);
        state.autoInterval = null;
        state.running = false;
        document.getElementById('autoBtn').innerHTML = '⏩ Auto Run';
      }
    }, delay);
  }
}

// Reset
function reset() {
  if (state.autoInterval) {
    clearInterval(state.autoInterval);
    state.autoInterval = null;
    state.running = false;
  }
  
  state.initialized = false;
  state.maxFlow = 0;
  state.pathCount = 0;
  state.currentPath = [];
  state.stepState = null;
  state.currentStep = 1;
  
  state.graph.edges.forEach(e => e.flow = 0);
  
  document.getElementById('stepBtn').disabled = true;
  document.getElementById('autoBtn').disabled = true;
  document.getElementById('autoBtn').innerHTML = '⏩ Auto Run';
  document.getElementById('initBtn').disabled = false;
  
  updateStep(1);
  clearPathTimeline();
  clearLog();
  updateMetrics();
  renderGraph();
  
  addLog('Visualization reset', 'info');
  showToast('Reset complete', 'info');
}

// Toggle View
function toggleView() {
  state.showFlow = !state.showFlow;
  document.getElementById('viewText').textContent = state.showFlow ? 'Flow View' : 'Residual View';
  renderGraph();
}

// Update Metrics
function updateMetrics() {
  const runtime = state.initialized ? Date.now() - state.startTime : 0;
  const n = state.graph.nodes.length;
  const e = state.graph.edges.length;
  const maxEdges = n * (n - 1);
  const density = maxEdges > 0 ? ((e / maxEdges) * 100).toFixed(1) : 0;
  
  document.getElementById('maxFlow').textContent = state.maxFlow;
  document.getElementById('pathCount').textContent = state.pathCount;
  document.getElementById('runtime').textContent = runtime;
  document.getElementById('density').textContent = density;
}

// Update Step
function updateStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const activeStep = document.querySelector(`.step[data-step="${step}"]`);
  if (activeStep) {
    activeStep.classList.add('active');
    activeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Add Path to Timeline
function addPathToTimeline(path, bottleneck) {
  const timeline = document.getElementById('pathTimeline');
  
  const placeholder = timeline.querySelector('.path-placeholder');
  if (placeholder) placeholder.remove();
  
  const card = document.createElement('div');
  card.className = 'path-card';
  card.setAttribute('data-path-number', `#${state.pathCount}`);
  card.innerHTML = `
    <div class="path-nodes">${path.join(' → ')}</div>
    <div class="path-info">
      <span class="path-bottleneck">Bottleneck: ${bottleneck}</span>
      <span class="path-flow">+${bottleneck}</span>
    </div>
  `;
  
  timeline.appendChild(card);
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
}

// Clear Path Timeline
function clearPathTimeline() {
  const timeline = document.getElementById('pathTimeline');
  timeline.innerHTML = `
    <div class="path-placeholder">
      <div class="path-placeholder-icon">🔍</div>
      <div>No paths found yet</div>
    </div>
  `;
}

// Add Log
function addLog(message, type = 'info') {
  const logPanel = document.getElementById('logPanel');
  const now = new Date();
  const time = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-message">${message}</span>
  `;
  
  logPanel.appendChild(entry);
  logPanel.scrollTop = logPanel.scrollHeight;
  
  const entries = logPanel.querySelectorAll('.log-entry');
  if (entries.length > 50) entries[0].remove();
}

// Clear Log
function clearLog() {
  document.getElementById('logPanel').innerHTML = `
    <div class="log-entry info">
      <span class="log-time">00:00</span>
      <span class="log-message">Log cleared</span>
    </div>
  `;
}

// Show Toast
function showToast(message, type = 'info') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Export Graph
function exportGraph() {
  const data = {
    graph: state.graph,
    maxFlow: state.maxFlow,
    pathCount: state.pathCount
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ford-fulkerson-graph.json';
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('Graph exported', 'success');
}

// IMPROVED: Render Graph with better label collision handling for dense graphs
function renderGraph() {
  const canvas = document.getElementById('canvas');
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
  canvas.setAttribute('viewBox', `0 0 ${width} ${height}`);
  
  while (canvas.firstChild) canvas.removeChild(canvas.firstChild);
  
  const svgNS = "http://www.w3.org/2000/svg";
  const theme = document.documentElement.getAttribute('data-theme');
  
  // Calculate graph density for label sizing
  const nodeCount = state.graph.nodes.length;
  const edgeCount = state.graph.edges.length;
  const maxPossibleEdges = nodeCount * (nodeCount - 1);
  const density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
  
  // Adaptive label sizing based on density
  let labelWidth = 50;
  let labelHeight = 20;
  let fontSize = '10';
  
  if (density > 0.4) { // Very dense
    labelWidth = 40;
    labelHeight = 16;
    fontSize = '8';
  } else if (density > 0.25) { // Dense
    labelWidth = 45;
    labelHeight = 18;
    fontSize = '9';
  }
  
  // Track label positions for collision detection
  const labelPositions = [];
  
  // Draw edges
  state.graph.edges.forEach(edge => {
    const u = state.graph.nodes.find(n => n.id === edge.u);
    const v = state.graph.nodes.find(n => n.id === edge.v);
    
    if (!u || !v) return;
    
    const isInPath = state.currentPath.length >= 2 &&
      state.currentPath.some((node, i) =>
        i < state.currentPath.length - 1 &&
        state.currentPath[i] === edge.u &&
        state.currentPath[i + 1] === edge.v
      );
    
    const isSaturated = edge.flow >= edge.capacity;
    
    const g = document.createElementNS(svgNS, "g");
g.classList.add('edge');
if (isSaturated) g.classList.add('saturated');
// Don't add 'path' class to the group
    
    // Curved path
    const midX = (u.x + v.x) / 2;
    const midY = (u.y + v.y) / 2;
    const dx = v.x - u.x;
    const dy = v.y - u.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const offset = Math.min(30, len * 0.15);
    const cx = midX - dy / len * offset;
    const cy = midY + dx / len * offset;
    
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute('d', `M ${u.x} ${u.y} Q ${cx} ${cy} ${v.x} ${v.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', isInPath ? '#10b981' : isSaturated ? '#64748b' : (theme === 'dark' ? '#cbd5e1' : '#94a3b8'));
    path.setAttribute('stroke-width', isInPath ? '3' : '2');
    path.setAttribute('opacity', isSaturated ? '0.4' : '1');
    
    if (isInPath) path.classList.add('path');//nweAddedLineForRectChange

    g.appendChild(path);
    
    // Arrow
    const t = 0.92;
    const arrowX = (1 - t) * (1 - t) * u.x + 2 * (1 - t) * t * cx + t * t * v.x;
    const arrowY = (1 - t) * (1 - t) * u.y + 2 * (1 - t) * t * cy + t * t * v.y;
    const tangentX = -2 * (1 - t) * u.x + 2 * (1 - 2 * t) * cx + 2 * t * v.x;
    const tangentY = -2 * (1 - t) * u.y + 2 * (1 - 2 * t) * cy + 2 * t * v.y;
    const angle = Math.atan2(tangentY, tangentX);
    
    const arrow = document.createElementNS(svgNS, "path");
    const arrowSize = 10;
    arrow.setAttribute('d', `
      M ${arrowX} ${arrowY}
      L ${arrowX - arrowSize * Math.cos(angle - Math.PI / 6)} ${arrowY - arrowSize * Math.sin(angle - Math.PI / 6)}
      L ${arrowX - arrowSize * Math.cos(angle + Math.PI / 6)} ${arrowY - arrowSize * Math.sin(angle + Math.PI / 6)}
      Z
    `);
    arrow.setAttribute('fill', isInPath ? '#10b981' : isSaturated ? '#64748b' : (theme === 'dark' ? '#cbd5e1' : '#94a3b8'));
    g.appendChild(arrow);
    
    // IMPROVED: Label positioning with advanced collision detection
    let labelX = 0.25 * u.x + 0.5 * cx + 0.25 * v.x;
    let labelY = 0.25 * u.y + 0.5 * cy + 0.25 * v.y;
    
    // Avoid nodes with larger radius
    state.graph.nodes.forEach(node => {
      const dist = Math.sqrt((labelX - node.x) ** 2 + (labelY - node.y) ** 2);
      if (dist < 45) {
        const awayX = labelX - node.x;
        const awayY = labelY - node.y;
        const awayLen = Math.sqrt(awayX * awayX + awayY * awayY) || 1;
        labelX += (awayX / awayLen) * 30;
        labelY += (awayY / awayLen) * 30;
      }
    });
    
    // Avoid other labels (smart collision resolution)
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      let collision = false;
      
      for (const pos of labelPositions) {
        const distX = Math.abs(labelX - pos.x);
        const distY = Math.abs(labelY - pos.y);
        
        // Check if labels overlap (with padding)
        if (distX < (labelWidth / 2 + pos.width / 2 + 5) && 
            distY < (labelHeight / 2 + pos.height / 2 + 5)) {
          collision = true;
          
          // Push label perpendicular to edge direction
          const perpX = -dy / len;
          const perpY = dx / len;
          labelX += perpX * 15;
          labelY += perpY * 15;
          break;
        }
      }
      
      if (!collision) break;
      attempts++;
    }
    
    // Store label position
    labelPositions.push({ x: labelX, y: labelY, width: labelWidth, height: labelHeight });
    
    const labelG = document.createElementNS(svgNS, "g");
    
    const labelRect = document.createElementNS(svgNS, "rect");
    labelRect.setAttribute('x', labelX - labelWidth / 2);
    labelRect.setAttribute('y', labelY - labelHeight / 2);
    labelRect.setAttribute('width', labelWidth);
    labelRect.setAttribute('height', labelHeight);
    labelRect.setAttribute('rx', '4');
    labelRect.setAttribute('fill', theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)');
    labelRect.setAttribute('stroke', theme === 'dark' ? '#475569' : '#cbd5e1');
    labelRect.setAttribute('stroke-width', '1');
    labelG.appendChild(labelRect);
    
    // FIXED: Single text element, proper font-weight
    const labelText = document.createElementNS(svgNS, "text");
    labelText.setAttribute('x', labelX);
    labelText.setAttribute('y', labelY);
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('dominant-baseline', 'middle');
    labelText.setAttribute('font-family', 'Courier New, monospace');
    labelText.setAttribute('font-size', fontSize);
    labelText.setAttribute('font-weight', '600'); // Consistent weight
    
    if (state.showFlow) {
  labelText.textContent = `${edge.flow}/${edge.capacity}`;
  labelText.setAttribute('fill', theme === 'dark' ? '#e2e8f0' : '#334155');
} else {
  const residual = state.residualGraph.get(edge.u)?.get(edge.v) || 0;
  labelText.textContent = `r:${residual}`;
  labelText.setAttribute('fill', theme === 'dark' ? '#e2e8f0' : '#334155');
}
    
    labelG.appendChild(labelText);
    g.appendChild(labelG);
    
    canvas.appendChild(g);
  });
  
  // Draw nodes
  state.graph.nodes.forEach((node, idx) => {
    const isSource = idx === 0;
    const isSink = idx === state.graph.nodes.length - 1;
    const isInPath = state.currentPath.includes(node.id);
    
    const g = document.createElementNS(svgNS, "g");
    g.classList.add('node');
    if (isSource) g.classList.add('source');
    if (isSink) g.classList.add('sink');
    if (isInPath) g.classList.add('visited');
    
    const circle = document.createElementNS(svgNS, "circle");
    circle.classList.add('node-circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', 25);
    circle.setAttribute('stroke-width', 2);
    g.appendChild(circle);
    
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', '700');
    text.textContent = node.id;
    g.appendChild(text);
    
    // Tooltip
    g.addEventListener('mouseenter', (e) => {
      const tooltip = document.getElementById('tooltip');
      const inDegree = state.graph.edges.filter(edge => edge.v === node.id).length;
      const outDegree = state.graph.edges.filter(edge => edge.u === node.id).length;
      tooltip.innerHTML = `
        <strong>${node.id}</strong><br>
        In: ${inDegree} | Out: ${outDegree}
      `;
      tooltip.classList.add('show');
    });
    
    g.addEventListener('mousemove', (e) => {
      const tooltip = document.getElementById('tooltip');
      tooltip.style.left = (e.clientX + 10) + 'px';
      tooltip.style.top = (e.clientY + 10) + 'px';
    });
    
    g.addEventListener('mouseleave', () => {
      document.getElementById('tooltip').classList.remove('show');
    });
    
    canvas.appendChild(g);
  });
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
  
  if (e.code === 'Space') {
    e.preventDefault();
    if (!document.getElementById('stepBtn').disabled) {
      step();
    }
  } else if (e.key === 'a' || e.key === 'A') {
    if (!document.getElementById('autoBtn').disabled) {
      toggleAuto();
    }
  } else if (e.key === 'r' || e.key === 'R') {
    reset();
  }
});

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  loadPreset('simple');
  addLog('System ready - Load a graph to begin', 'success');
});

// Handle window resize
window.addEventListener('resize', () => {
  if (state.graph.nodes.length > 0) {
    positionNodes();
    renderGraph();
  }
});
