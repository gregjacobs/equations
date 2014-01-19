var _ = require( 'lodash' ),
    Graph = require( './Graph' ),
    TopologicalSorter = require( './TopologicalSorter' );

/**
 * Resolves the dependencies in the input equations, and produces an output equation map
 * with all dependencies expanded to replace the original input variables.
 * 
 * Example:
 * 
 *     inputEquations = {
 *         'A' : 'B+2',
 *         'B' : 'C+5',
 *         'C' : '1',
 *         'D' : 'A+B'
 *     }
 *     
 * 
 *     expandedEquations = {  // retrievable by {@link #getExpandedEquations}
 *         'A' : '1+5+2',
 *         'B' : '1+5',
 *         'C' : '1',
 *         'D' : '1+5+2+1+5'
 *     }
 *     
 * Before using {@link #getExpandedEquations} to retrieve the map of output equations, one must check
 * {@link #hasCycle} first to determine if there is a cycle in the equations. If there is a cycle, then
 * {@link #getExpandedEquations} will throw an error since there is no topological sort with the existence
 * of a directed cycle.
 * 
 * @constructor
 * @param {Object} inputEquations An Object (map) of the input equations. See example above.
 */
var EquationResolver = function( inputEquations ) {
	this.inputEquations = inputEquations;
	
	var graph = this.buildGraph( inputEquations ),
	    topologicalSorter = new TopologicalSorter( graph );
	
	if( topologicalSorter.hasCycle() ) {
		this.graphCycle = topologicalSorter.getCycle();
	} else {
		this.topologicalOrder = topologicalSorter.getOrdering();
	}
};

EquationResolver.prototype = {
	constructor : EquationResolver,  // re-add `constructor` property when overwriting `prototype` object
	
	/**
	 * @private
	 * @property {Boolean} graphHasCycle
	 * 
	 * Flag which is set to `true` if the inputEquations form a graph that has a directed cycle.
	 * Retrieve with the {@link #hasCycle} method.
	 */
	
	/**
	 * @private
	 * @property {String[]} cycle
	 * 
	 * If the graph has a cycle ({@link #graphHasCycle} is `true`), then this property will be populated
	 * with an array of strings that describes the cycle. Ex: [ 'A', 'B', 'C', 'A' ]. Running `.join('->')`
	 * on this array will produce "A->B->C->A".
	 */
	
	/**
	 * @private
	 * @property {String[]} topologicalOrder
	 * 
	 * The topological ordering of the graph given by the inputEquations. The first element in this array
	 * is the equation that must be solved first, the second must be solved second, etc.
	 * 
	 * For example, an inputEquations map of:
	 * 
	 *     {
	 *         "A" : "B+2",
	 *         "B" : "C+5",
	 *         "C" : "1",
	 *         "D" : "A+B"
	 *     };
	 *     
	 * will produce a topological sort of: 
	 *  
	 *     [ 'C', 'B', 'A', 'D' ]
	 *     
	 * since 'C' must be solved before, 'B', and 'B' must be solved before 'A', and both 'A' and 'B' must
	 * be solved before 'D'.
	 */
	
	
	/**
	 * @private
	 * @property {RegExp} exprVarTokenRe
	 * 
	 * The regular expression used to parse the variables out of an input equation.
	 * 
	 * For example: "A+B+1".match( this.exprVarTokenRe );  // [ 'A', 'B' ]
	 */
	exprVarTokenRe : /\b[A-Z]+\b(?!\()/g,  // capital letters not followed by an opening parenthesis. Don't want to catch function calls.
	

	/**
	 * Builds a directed graph based on the input equations.
	 * 
	 * Example input equations:
	 * 
	 *     {
	 *         'A' : 'B+2',
	 *         'B' : 'C+5',
	 *         'C' : '1',
	 *         'D' : 'A+B'
	 *     }
	 * 
	 * @private
	 * @param {Object} inputEquations An Object (map) of the input equations. See example above.
	 * @return {Graph}
	 */
	buildGraph : function( inputEquations ) {
		var graph = new Graph(),
		    exprVarTokenRe = this.exprVarTokenRe;
		
		// Parse the input equations into a directed Graph of dependencies
		_.forOwn( inputEquations, function( expr, exprName ) {
			graph.addVertex( exprName );
			
			var exprDependencies = expr.match( exprVarTokenRe ) || [];
			_.forEach( exprDependencies, function( exprDependencyName ) {
				graph.addVertex( exprDependencyName );  // add if not yet there
				graph.addEdge( exprName, exprDependencyName );
			} );
		} );
		
		return graph;
	},


	/**
	 * Determines if the input equations passed to the EquationResolver's contructor have a cycle within them.
	 * 
	 * @return {Boolean} `true` if there is a cycle, `false` if there is not.
	 */
	hasCycle : function() {
		return !!this.graphCycle;  // if `this.graphCycle` exists, then there is a cycle
	},
	
	
	/**
	 * Retrieves the cycle detected in the input expressoins passed to the EquationResolver's constructor, if 
	 * there is one. Use {@link #hasCycle} to determine if there is a cycle.
	 * 
	 * @return {String[]} A list of the equations that form a cycle. Ex: [ 'A', 'B', 'C', 'A' ]
	 */
	getCycle : function() {
		return this.graphCycle;
	},
	
	
	/**
	 * Retrieves the expanded output equations.
	 * 
	 * Example: 
	 * 
	 *     inputEquations = {
	 *         'A' : 'B+2',
	 *         'B' : 'C+5',
	 *         'C' : '1',
	 *         'D' : 'A+B'
	 *     }
	 *     
	 *     expandedEquations = {
	 *         'A' : '1+5+2',
	 *         'B' : '1+5',
	 *         'C' : '1',
	 *         'D' : '1+5+2+1+5'
	 *     }
	 * 
	 * Note that ordering is not guaranteed in the expanded output equations.
	 * 
	 * @return {Object} An Object (map) of the output equations, with all variables replaced with their "expanded"
	 *   dependencies.
	 */
	getExpandedEquations : function() {
		if( this.hasCycle() ) throw new Error( "Input equations have a cycle. Cannot resolve dependencies in equations." );
		
		var inputEquations = this.inputEquations,
		    expandedEquations = {},
		    exprVarTokenRe = this.exprVarTokenRe;
		
		// Resolve the variables in the correct order (i.e. the order of the topological sort)
		_.forEach( this.topologicalOrder, function( exprName ) {
			expandedEquations[ exprName ] = inputEquations[ exprName ].replace( exprVarTokenRe, function( exprVar ) {
				return expandedEquations[ exprVar ];
			} );
		} );
		
		return expandedEquations;
	}

};

module.exports = EquationResolver;