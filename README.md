Simple test program that I put together for resolving and expanding dependent variables in a set of equations.


### Motivation

This came up at work one day, where we needed to substitute variables in a set of equations with the expressions of
other equations. In the interest of time, we simply went with a top-down regular expression parsing / map lookup 
based routine of expanding the variables, where the dependent equations needed to exist before the ones that 
depended on them.

For Example:

```javascript
// Input equations
A = 1
B = A + 2        // 'A' must come before 'B' in our naive solution
C = A + B + 3    // 'A' and 'B' must come before 'C' in our naive solution

// These would be expanded to:
A = 1
B = (1) + 2
C = (1) + (1 + 2) + 3

// (parens added for clarity)
```    

So in my free time, I set out to solve this "variable expanding" problem in a way that wouldn't rely on the order in
which the equations were specified. 

Example:

```javascript
// Input equations
A = B + 2
B = C + 5
C = 1
D = A + B

// These would be expanded to:
A = (1 + 5) + 2
B = (1) + 5
C = 1
D = (1 + 5 + 2) + (1 + 5)

// (again, parens added for clarity)
```

The solution that I came up with is a simple graph-based topological sort of the dependent variables in the equations,
in which the variables are then substituted with their dependencies in the correct order. It also detects if there are
any cycles in the graph, in which case it prints out an error message and the cycle.


### Running 

If you're interested in running the program, you'll need [Node.js](http://nodejs.org) installed. Clone the repository,
execute `npm install` from the command line from within the directory, and then run `node equations.js`
