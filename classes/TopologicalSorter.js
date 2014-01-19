var _ = require( 'lodash' );

var TopologicalSorter = function( graph ) {
	this.marked = {};   // for marking vertices as "found" as we find them, as to not visit them again 
	this.ordering = [];
	
	// For cycle checking
	this.onStack = {};  // If a vertex is on the stack when we visit it during our DFS, then there is a directed cycle
	this.edgeTo = {};   // A map of the edges to vertices as we discover them. edgeTo[ w ] = v
	this.cycle = null;  // in case there's a cycle, this will be an array of the vertices that form the first-discovered cycle
	
	// Perform a depth-first search from each vertex that has not yet been visited 
	_.forEach( graph.getVertices(), function( vertex ) {
		if( !this.marked[ vertex ] ) {
			this.dfs( graph, vertex );
		}
	}, this );
}


TopologicalSorter.prototype = {
	constructor : TopologicalSorter,  // re-add `constructor` property when overwriting `prototype` object
	
	/**
	 * Performs a recursive depth-first search of the `graph`, storing the post-order traversal in the {@link #ordering}
	 * property (which is the topological sort). Also provides cycle detection, which is available from the
	 * {@link #hasCycle} and {@link #getCycle} methods.
	 * 
	 * @private
	 * @param {Graph} graph The graph to traverse.
	 * @param {String} v The vertex to start from.
	 */
	dfs : function( graph, v ) {
		this.marked[ v ] = true;
		this.onStack[ v ] = true;
		
		_.forEach( graph.getAdjacencyList( v ), function( w ) {
			if( this.cycle != null ) {
				return;   // if there's a cycle, return out. We need a DAG (directed acyclic graph) for a topological sort
				
			} else if( !this.marked[ w ] ) {
				this.edgeTo[ w ] = v;
				this.dfs( graph, w );
				
			} else if( this.onStack[ w ] ) {
				this.cycle = [];
				
				this.cycle.unshift( w );
				for( var x = v; x != w; x = this.edgeTo[ x ] ) {
					this.cycle.unshift( x );
				}
				this.cycle.unshift( w );
			}
		}, this );
		
		delete this.onStack[ v ];
		
		// After the vertex has been visited, add it to the ordering. This is a "post" ordering, which
		// produces our topological sort.
		this.ordering.push( v );
	},
	

	/**
	 * Returns `true` if the input graph had a cycle, or `false` otherwise.
	 * 
	 * @return {Boolean}
	 */
	hasCycle : function() {
		return this.cycle != null;
	},
	
	
	/**
	 * Retrieves the first-discovered cycle in the graph if there is one. This will be an array of strings that 
	 * describes the cycle. 
	 * 
	 * Ex: 
	 *     
	 *     [ 'A', 'B', 'C', 'A' ]. 
	 *     
	 * Running `.join('->')` on this array will produce "A->B->C->A".
	 * 
	 * @return {String[]}
	 */
	getCycle : function() {
		return this.cycle;
	},

	
	/**
	 * Retrieves the ordering that was produced by the topological sort. This is the vertices of the graph in 
	 * dependency order.
	 * 
	 * Ex: [ 'C', 'B', 'A', 'D' ]
	 * 
	 * Use {@link #hasCycle} first to determine if it was possible to produce a topological ordering (a graph with
	 * a cycle has no topological ordering). If the graph had a cycle, this method throws an error.
	 * 
	 * @return {String[]}
	 */
	getOrdering : function() {
		if( this.hasCycle() ) throw new Error( "Graph has a cycle, no topological ordering exists" );
		
		return this.ordering;
	}

};

module.exports = TopologicalSorter;