## Theory: Ford–Fulkerson Algorithm for Maximum Flow

## 1. Introduction

The **Maximum Flow Problem** is a fundamental problem in graph theory and network optimization. It focuses on determining the maximum amount of flow that can be sent from a **source node** to a **sink node** in a directed graph while respecting capacity constraints on edges.

The **Ford–Fulkerson algorithm** is one of the earliest and most intuitive methods developed to solve this problem. It forms the basis for many advanced flow algorithms and has applications in communication networks, transportation systems, scheduling, and resource allocation.

## 2. Flow Network Model

A flow network is defined as a directed graph G = (V, E) where:

- V is the set of vertices (nodes)
- E is the set of directed edges
- Each edge (u, v) ∈ E has a **capacity** c(u, v) ≥ 0
- A distinguished **source** node s ∈ V
- A distinguished **sink** node t ∈ V

## 3. Flow Constraints

A flow function f(u, v) must satisfy the following constraints:

### 3.1 Capacity Constraint

For every edge (u, v) ∈ E:

0 ≤ f(u, v) ≤ c(u, v)

### 3.2 Flow Conservation

For every vertex v ∈ V \ {s, t}:

Sum of incoming flow = Sum of outgoing flow

### 3.3 Value of Flow

The total flow from the source is defined as the sum of all flows leaving the source node.

## 4. Residual Graph

The **residual graph** Gf = (V, Ef) is a key data structure that represents the remaining capacity available for sending additional flow **after** some flow has already been assigned to the network.

### 4.1 Construction of the Residual Graph

For each edge (u, v) ∈ E in the original graph:

- **Forward edge**: A residual edge (u, v) with residual capacity cf(u, v) = c(u, v) − f(u, v). This represents how much **more** flow can still be pushed in the original direction.
- **Backward edge**: A residual edge (v, u) with residual capacity cf(v, u) = f(u, v). This represents the amount of flow that **has already been sent** from u to v and can potentially be **cancelled or rerouted**.

An edge appears in the residual graph only if its residual capacity is greater than zero.

### 4.2 Why Backward Edges Matter

Backward edges are essential because they allow the algorithm to **undo** previously made flow decisions. Without them, a greedy choice in an early iteration could permanently block the optimal solution.

For example, suppose the algorithm initially sends flow along a suboptimal path that "uses up" an edge needed by a better overall routing. The backward edge on that edge allows a later augmenting path to effectively **reverse** part of that flow, redirecting it through a more efficient route. This mechanism ensures the algorithm can always reach the true maximum flow.

### 4.3 Residual Graph Updates

After each augmentation (sending flow along a path):
- Forward edge residual capacities **decrease** (less room for additional flow)
- Backward edge residual capacities **increase** (more flow available to undo)

The residual graph is rebuilt after every augmenting path is processed.

## 5. Ford–Fulkerson Method

### 5.1 Core Idea

The algorithm is based on the principle of **iterative augmentation**: repeatedly finding paths from source to sink that can carry additional flow, and pushing flow along them.

The algorithm repeatedly:

1. Finds an **augmenting path** from source to sink in the residual graph
2. Determines the **bottleneck capacity** (minimum residual capacity along the path)
3. Augments the flow by the bottleneck value
4. Updates the residual graph

This process continues until no augmenting path exists.

### 5.2 How Augmentation Works

When an augmenting path is found, the algorithm pushes flow equal to the bottleneck capacity along the path. For each edge on this path:

- If it is a **forward edge** (u, v): the flow f(u, v) in the original network **increases** by the bottleneck value. This means more flow is being sent along this edge.
- If it is a **backward edge** (v, u): the flow f(u, v) in the original network **decreases** by the bottleneck value. This effectively **cancels** some previously assigned flow, freeing it to be rerouted through a different path.

This dual mechanism — pushing flow forward and pulling it back — is what gives the algorithm its power to converge to the global optimum despite making local decisions.

### 5.3 Algorithm Steps

1. Initialize flow on all edges to **0**
2. Construct the residual graph
3. While there exists an augmenting path from s to t:
   - Find the bottleneck capacity along the path
   - Augment the flow along forward and backward edges
   - Update residual capacities
4. When no path exists, the current flow is **maximum flow**

## 6. Augmenting Path Search

In practice, augmenting paths are found using:

- **DFS** (generic Ford–Fulkerson)
- **BFS** (Edmonds–Karp variant)

The choice of search strategy has significant implications for correctness and performance:

- **DFS-based Ford–Fulkerson** may fail to converge to the maximum flow when edge capacities are irrational. In such cases, the flow values may converge to a value that is **not** the maximum flow — this is a non-convergence issue, not an infinite loop.
- **BFS-based (Edmonds–Karp)** avoids this problem entirely by guaranteeing termination in at most O(VE) augmentations, regardless of capacity values. By always selecting the **shortest augmenting path** (fewest edges), it provides a polynomial-time guarantee of O(VE²).

## 7. Time and Space Complexity

### 7.1 Time Complexity

- **Generic Ford–Fulkerson (DFS)**: Depends on the number of augmenting paths and capacity values. With integer capacities, bounded by O(E × |f*|) where |f*| is the maximum flow value. With irrational capacities, may not converge.
- **Edmonds–Karp (BFS-based)**: O(VE²) — polynomial time regardless of capacity values

### 7.2 Space Complexity

- **Adjacency list + residual graph**: O(V + E)

## 8. Max-Flow Min-Cut Theorem

The **Max-Flow Min-Cut Theorem** states:

> The maximum flow from source to sink is equal to the minimum capacity of any cut separating the source and sink.

After the algorithm terminates:

- Nodes reachable from the source in the residual graph form one side of the minimum cut
- Edges crossing the cut define the cut capacity

## 9. Applications

1. **Computer Networks**: Bandwidth allocation and routing
2. **Transportation Systems**: Traffic and logistics optimization
3. **Bipartite Matching**: Job assignment and resource matching
4. **Project Scheduling**: Task dependency resolution
5. **Image Segmentation**: Graph-cut based vision algorithms

## 10. Summary

The Ford–Fulkerson algorithm provides a foundational framework for solving maximum flow problems. By iteratively finding augmenting paths in the residual graph and pushing flow along them — including the ability to reverse previously assigned flow via backward edges — the algorithm demonstrates how local, greedy decisions can be corrected to reach a globally optimal solution. The residual graph and its backward edges are the key mechanism that enables this self-correcting behavior, forming the basis for many modern network flow algorithms.