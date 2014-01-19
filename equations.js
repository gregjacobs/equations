/*
 * This file represents a simple work problem of equations and "expanding" variables with their dependencies.
 * 
 * For example, we could have the following equations:
 * 
 *     A=B+2
 *     B=C+5
 *     C=1
 *     D=A+B
 * 
 * We want to "expand" the variables in each of the expressions in dependency order. This program
 * performs this operation. The output from above would be:
 * 
 *     A=1+5+2
 *     B=1+5
 *     C=1
 *     D=1+5+2+1+5
 *    
 * Cycles in the input expressions are handled as well by printing an error message.
 */

var _ = require( 'lodash' ),
    ExpressionResolver = require( './classes/ExpressionResolver' );

var inputExpressions = {
	"A" : "B+2",
	"B" : "C+5",
	"C" : "1",
	"D" : "A+B"
};

// First print the input expressions
console.log( "Input Expressions:\n" + expressionsToString( inputExpressions ) + "\n" );


// Now print the output expressions
var expressionResolver = new ExpressionResolver( inputExpressions );
if( expressionResolver.hasCycle() ) {
	console.log( "Expressions have a cycle, cannot resolve. Cycle: " + expressionResolver.getCycle().join( "->" ) );
	
} else {
	var expandedExpressions = expressionResolver.getExpandedExpressions();
	console.log( "Output (Expanded) Expressions:\n" + expressionsToString( expandedExpressions ) );
}


// --------------------------------------

// Utility functions

/**
 * Takes an input map of expressions and creates a string can be pretty-printed to the console.
 * 
 * Example input map:
 *     
 *     {
 *         'A' : 'B+2'
 *         'B' : 'C+5'
 *         'C' : '1'
 *         'D' : 'A+B'
 *     }
 * 
 * @param {Object} expressions An Object (map) keyed by the expression name, and whose values are the expressions
 *   themselves.
 * @return {String} A stringified form of the `expressions` that can be printed to the console.
 */
function expressionsToString( expressions ) {
	// Loop in the correct order of the expressions by name, looking up the expressions as we go
	var orderedKeys = _.keys( expressions ).sort(),
	    stringBuilder = [];
	
	_.forEach( orderedKeys, function( key ) {
		stringBuilder.push( key + "=" + expressions[ key ] );
	} );
	return stringBuilder.join( "\n" );
}