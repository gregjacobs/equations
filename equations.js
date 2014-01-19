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
 * We want to "expand" the variables in each of the equations in dependency order. This program
 * performs this operation. The output from above would be:
 * 
 *     A=1+5+2
 *     B=1+5
 *     C=1
 *     D=1+5+2+1+5
 *    
 * Cycles in the input equations are handled as well by printing an error message.
 */

var _ = require( 'lodash' ),
    EquationResolver = require( './classes/EquationResolver' );

var inputEquations = {
	"A" : "B+2",
	"B" : "C+5",
	"C" : "1",
	"D" : "A+B"
};

// First print the input equations
console.log( "Input Equations:\n" + equationsToString( inputEquations ) + "\n" );


// Now print the output equations, or an error message if there is a cycle
var equationResolver = new EquationResolver( inputEquations );
if( equationResolver.hasCycle() ) {
	console.log( "Equations have a cycle, cannot resolve. Cycle: " + equationResolver.getCycle().join( "->" ) );
	
} else {
	var expandedEquations = equationResolver.getExpandedEquations();
	console.log( "Output (Expanded) Equations:\n" + equationsToString( expandedEquations ) );
}


// --------------------------------------

// Utility functions

/**
 * Takes an input map of equations and creates a string can be pretty-printed to the console.
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
 * @param {Object} equations An Object (map) keyed by the equation name, and whose values are the equations
 *   themselves.
 * @return {String} A stringified form of the `equations` that can be printed to the console.
 */
function equationsToString( equations ) {
	// Loop in the correct order of the equations by name, looking up the equations as we go
	var orderedKeys = _.keys( equations ).sort(),
	    stringBuilder = [];
	
	_.forEach( orderedKeys, function( key ) {
		stringBuilder.push( key + "=" + equations[ key ] );
	} );
	return stringBuilder.join( "\n" );
}