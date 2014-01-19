var _ = require( 'lodash' );

/**
 * @class Graph
 * 
 * A simple adjacency-list based directed graph of string vertices.
 */
var Graph = function() {
	this.vertices = {};  // set keyed by vertex name (and whose values are all `true`, since there is no true "set" datatype in JS)
	this.adj = {};       // map keyed by vertex name, whose values of arrays of vertices. These are the adjacency lists of the vertices of the graph.
};

Graph.prototype = {
	constructor : Graph,  // re-add `constructor` property when overwriting `prototype` object
	
	
	/**
	 * Adds a vertex to the graph.
	 * 
	 * @param {String} v The vertex to add to the graph. Vertices will not be added twice.
	 */
	addVertex : function( v ) {
		this.vertices[ v ] = true;
	},
	
	
	/**
	 * Returns the array of vertices in the graph.
	 * 
	 * @return {String[]}
	 */
	getVertices : function() {
		return _.keys( this.vertices );
	},
	
	
	/**
	 * Adds an edge from `v` (the "from" vertex) to `w` (the "to" vertex). 
	 * 
	 * @param {String} v The "from" vertex.
	 * @param {String} w The "to" vertex.
	 */
	addEdge : function( v, w ) {
		var adj = this.adj;
		
		// Initialize the adjacency list for this vertex if one does not yet exist
		if( !adj[ v ] ) 
			adj[ v ] = [];
		
		// Add the edge to `w` if it does not already exist
		if( !_.contains( adj[ v ], w ) )
			adj[ v ].push( w );
	},
	
	
	/**
	 * Retrieves the adjacency list for the given vertex `v`. 
	 * 
	 * The adjacency list is all of the vertices where a directed edge exists from `v` to `w`.
	 * 
	 * @param {String} v The vertex to retrieve the adjacency list for.
	 * @return {String[]} 
	 */
	getAdjacencyList : function( v ) {
		return this.adj[ v ] || [];
	}
	
};

module.exports = Graph;