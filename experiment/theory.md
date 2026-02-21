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

The **residual graph** Gf = (V, Ef) represents the remaining capacity available for sending additional flow.

For each edge (u, v):

- **Forward edge residual capacity**: cf(u, v) = c(u, v) - f(u, v)
- **Backward edge residual capacity**: cf(v, u) = f(u, v)

Residual edges allow the algorithm to **undo or redirect flow**, enabling better solutions.

## 5. Ford–Fulkerson Method

### 5.1 Core Idea

The algorithm repeatedly:

1. Finds an **augmenting path** from source to sink in the residual graph
2. Determines the **bottleneck capacity** (minimum residual capacity along the path)
3. Augments the flow by the bottleneck value
4. Updates the residual graph

This process continues until no augmenting path exists.

### 5.2 Algorithm Steps

1. Initialize flow on all edges to **0**
2. Construct the residual graph
3. While there exists an augmenting path from s to t:
   - Find the bottleneck capacity along the path
   - Augment the flow
   - Update residual capacities
4. When no path exists, the current flow is **maximum flow**

## 6. Augmenting Path Search

In practice, augmenting paths are found using:

- **DFS** (generic Ford–Fulkerson)
- **BFS** (Edmonds–Karp variant)

Using BFS ensures predictable performance and avoids infinite loops when capacities are irrational.

## 7. Time and Space Complexity

### 7.1 Time Complexity

- **Generic Ford–Fulkerson**: Depends on the number of augmenting paths and capacity values. Worst case: **unbounded** for irrational capacities
- **Edmonds–Karp (BFS-based)**: O(VE²)

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

The Ford–Fulkerson algorithm provides a foundational framework for solving maximum flow problems. By iteratively improving flow using augmenting paths and residual graphs, it demonstrates how local decisions lead to globally optimal solutions, forming the basis for many modern network flow algorithms.