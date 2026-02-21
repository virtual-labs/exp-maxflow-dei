## Procedure for Ford–Fulkerson Maximum Flow Experiment

## Step 1: Access the Simulation

1. Open the experiment and navigate to the **Simulation** page.
2. The Ford–Fulkerson visualizer loads with a default **Simple Network** preset.
3. The interface is divided into:
   - **Left Panel**: Graph configuration and algorithm controls
   - **Center Panel**: Network graph visualization
   - **Right Panel**: Analysis, metrics, explanations, and logs

## Step 2: Select or Define the Network

You can configure the flow network in two ways:

### A. Use Preset Networks

1. Choose a preset from the **Network Presets** section:
   - **Simple**: Basic 4-node network
   - **Medium**: Standard textbook example
   - **Complex**: Network with multiple augmenting paths
   - **Large**: Larger network to observe scalability
2. The edge list, source, and sink nodes are automatically populated.

### B. Define a Custom Network

1. Enter edges in the **Graph Definition** field using the format:
   - Each line: source, destination, capacity
   - Example: A,B,10 (edge from A to B with capacity 10)
2. Specify the **Source Node** (e.g., S)
3. Specify the **Sink Node** (e.g., T)
4. Click **Build Graph** to visualize your custom network

## Step 3: Initialize the Algorithm

1. Click the **Initialize** button to prepare the algorithm.
2. Observe:
   - All edge flows are set to 0
   - Initial residual graph is created
   - Statistics panel shows: Current Flow = 0, Iterations = 0

## Step 4: Select Path-Finding Method

Choose how augmenting paths will be discovered:

1. **DFS (Depth-First Search)**: Original Ford–Fulkerson approach
2. **BFS (Breadth-First Search)**: Edmonds–Karp variant with better complexity

The selected method affects path discovery order and performance.

## Step 5: Step Through the Algorithm

1. Click **Step** to execute one iteration of the algorithm.
2. Each step performs the following:
   - **Find Augmenting Path**: Highlights the path from source to sink in the residual graph
   - **Calculate Bottleneck**: Shows minimum residual capacity along the path
   - **Update Flow**: Augments flow along the path by bottleneck value
   - **Update Residual Graph**: Recalculates forward and backward edge capacities

3. Observe visualizations:
   - **Current path** highlighted in color
   - **Edge labels** show current flow / capacity
   - **Residual edges** update in real-time

## Step 6: Use Auto-Play Mode

1. Click **Play** to run the algorithm automatically.
2. Adjust the **Speed Slider** to control visualization pace (50ms to 2s per step).
3. Click **Pause** to stop and examine the current state.

## Step 7: Analyze Results

After the algorithm terminates (no more augmenting paths):

1. **Maximum Flow Value**: Displayed in the statistics panel
2. **Final Flow Network**: Shows flow on each edge
3. **Min-Cut Visualization**: Nodes reachable from source are highlighted
4. **Iteration Count**: Total number of augmenting paths found
5. **Path History**: Complete log of all augmenting paths and bottleneck values

## Step 8: Examine the Min-Cut

1. After completion, the algorithm identifies the minimum cut.
2. Observe:
   - **Source-side nodes** highlighted in one color
   - **Sink-side nodes** highlighted in another color
   - **Cut edges** (crossing the partition) are marked
   - **Cut capacity** equals the maximum flow (verifying Max-Flow Min-Cut Theorem)

## Step 9: Compare Path-Finding Methods

1. Click **Reset** to clear all progress.
2. Run the algorithm using **DFS**.
3. Note the number of iterations and paths found.
4. Reset again and run using **BFS**.
5. Compare the efficiency and path choices between the two methods.

## Step 10: Experiment with Different Networks

1. Try different preset networks to see how network structure affects:
   - Number of augmenting paths
   - Convergence speed
   - Maximum flow value
2. Create custom networks to test specific scenarios.

## Keyboard Shortcuts

- **Space/Enter**: Step forward
- **Ctrl+P**: Toggle Play/Pause
- **Ctrl+I**: Initialize
- **Ctrl+R**: Reset

## Key Observations to Make

- How residual capacities change after each augmentation
- The relationship between forward and backward edges
- Why the algorithm terminates (no path in residual graph)
- Verification that max flow equals min cut capacity
- Performance difference between DFS and BFS path selection