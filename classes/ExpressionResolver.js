var _ = require( 'lodash' ),
    Graph = require( './Graph' ),
    TopologicalSorter = require( './TopologicalSorter' );

/**
 * Resolves the dependencies in the input expressions, and produces an output expression map
 * with all dependencies expanded to replace the original input variables.
 * 
 * Example:
 * 
 *     inputExpressions = {
 *         'A' : 'B+2',
 *         'B' : 'C+5',
 *         'C' : '1',
 *         'D' : 'A+B'
 *     }
 *     
 * 
 *     expandedExpressions = {  // retrievable by {@link #getExpandedExpressions}
 *         'A' : '1+5+2',
 *         'B' : '1+5',
 *         'C' : '1',
 *         'D' : '1+5+2+1+5'
 *     }
 *     
 * Before using {@link #getExpandedExpressions} to retrieve the map of output expressions, one must check
 * {@link #hasCycle} first to determine if there is a cycle in the expressions. If there is a cycle, then
 * {@link #getExpandedExpressions} will throw an error since there is no topological sort with the existence
 * of a directed cycle.
 * 
 * @constructor
 * @param {Object} inputExpressions An Object (map) of the input expressions. See example above.
 */
var ExpressionResolver = function( inputExpressions ) {
	this.inputExpressions = inputExpressions;
	
	var graph = this.buildGraph( inputExpressions ),
	    topologicalSorter = new TopologicalSorter( graph );
	
	this.graphHasCycle = topologicalSorter.hasCycle();
	if( this.graphHasCycle ) {
		this.graphCycle = topologicalSorter.getCycle();
	} else {
		this.topologicalOrder = topologicalSorter.getOrdering();
	}
};

ExpressionResolver.prototype = {
	constructor : ExpressionResolver,  // re-add `constructor` property when overwriting `prototype` object
	
	/**
	 * @private
	 * @property {Boolean} graphHasCycle
	 * 
	 * Flag which is set to `true` if the inputExpressions form a graph that has a directed cycle.
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
	 * The topological ordering of the graph given by the inputExpressions. The first element in this array
	 * is the equation that must be solved first, the second must be solved second, etc.
	 * 
	 * For example, an inputExpressions map of:
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
	 * The regular expression used to parse the variables out of an input expression.
	 * 
	 * For example: "A+B+1".match( exprVarTokenRe );  // [ 'A', 'B' ]
	 */
	exprVarTokenRe : /\b[A-Z]+\b(?!\()/g,  // capital letters not followed by an opening parenthesis. Don't want to catch function calls.
	

	/**
	 * Builds a directed graph based on the input expressions.
	 * 
	 * Example input expressions:
	 * 
	 *     {
	 *         'A' : 'B+2',
	 *         'B' : 'C+5',
	 *         'C' : '1',
	 *         'D' : 'A+B'
	 *     }
	 * 
	 * @private
	 * @param {Object} inputExpressions An Object (map) of the input expressions. See example above.
	 * @return {Graph}
	 */
	buildGraph : function( inputExpressions ) {
		var graph = new Graph(),
		    exprVarTokenRe = this.exprVarTokenRe;
		
		// Parse the input expressions into a directed Graph of dependencies
		_.forOwn( inputExpressions, function( expr, exprName ) {
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
	 * Determines if the input expressions passed to the ExpressionResolver's contructor have a cycle within them.
	 * 
	 * @return {Boolean} `true` if there is a cycle, `false` if there is not.
	 */
	hasCycle : function() {
		return this.graphHasCycle;
	},
	
	
	/**
	 * Retrieves the cycle detected in the input expressoins passed to the ExpressionResolver's constructor, if 
	 * there is one. Use {@link #hasCycle} to determine if there is a cycle.
	 * 
	 * @return {String[]} A list of the expressions that form a cycle. Ex: [ 'A', 'B', 'C', 'A' ]
	 */
	getCycle : function() {
		return this.graphCycle;
	},
	
	
	/**
	 * Retrieves the expanded output expressions.
	 * 
	 * Example: 
	 * 
	 *     inputExpressions = {
	 *         'A' : 'B+2',
	 *         'B' : 'C+5',
	 *         'C' : '1',
	 *         'D' : 'A+B'
	 *     }
	 *     
	 *     expandedExpressions = {
	 *         'A' : '1+5+2',
	 *         'B' : '1+5',
	 *         'C' : '1',
	 *         'D' : '1+5+2+1+5'
	 *     }
	 * 
	 * Note that ordering is not guaranteed in the expanded output expressions.
	 * 
	 * @return {Object} An Object (map) of the output expressions, with all variables replaced with their "expanded"
	 *   dependencies.
	 */
	getExpandedExpressions : function() {
		if( this.hasCycle() ) throw new Error( "Input expressions have a cycle. Cannot resolve dependencies in expressions." );
		
		var inputExpressions = this.inputExpressions,
		    expandedExpressions = {},
		    exprVarTokenRe = this.exprVarTokenRe;
		
		// Resolve the variables in the correct order (i.e. the order of the topological sort)
		_.forEach( this.topologicalOrder, function( exprName ) {
			expandedExpressions[ exprName ] = inputExpressions[ exprName ].replace( exprVarTokenRe, function( exprVar ) {
				return expandedExpressions[ exprVar ];
			} );
		} );
		
		return expandedExpressions;
	}

};

module.exports = ExpressionResolver;