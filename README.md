凹 (Āo) 
=======

[![Experimental](https://img.shields.io/badge/status-experimental-blue.svg)](https://shields.io/)
[![NPM availability: not available yet](https://img.shields.io/badge/npm-pending-orange.svg)](https://shields.io/)

Ao is an attempt at creating a Lisp-like programming language with Javascript using a syntax tree built on JSON arrays.

## Lisp?

Lisp is a list-based functional programming language where code and data both are represented as lists. This puts Lisp in a very special position: Lisp code can easily change itself. i.e. A program written in Lisp can re-arrange and change parts of it's own code, live!

On the other hand, Javascript and JSON employs one of the most dynamic and non-restrictive array structure. Therefore, I believed, with a bit of coding, it's possible to represent Lisp-like code with JSON arrays.

When you run this Javascript file through NodeJS, or open the HTML file and look at the browser console, you will see that the execution happens on a JSON array that was created from the original syntax.

## How to test

Clone this repository first. Then, either,

- The easiest way is to just run the Javascript file in NodeJS as `node seventeen`.
- Otherwise, open the `index.html` in a browser (Chrome/FireFox). Then open the browser developer tools to see the console output.

Change the Ao code in the Javascript file to test your own Ao code.

## Examples

### Function definition

Let's look at how to define and call a simple function in Ao:

```scheme
((defun foo (a b)
	(print (~ a ' ' b)))
 (foo 123 '456'))
```

This is ported into a JSON array:

```javascript
[
    ["defun", "foo", ["a", "b"],
        ["print", ["concat", "a", "' '", "b"]]
    ],
    ["foo", 123, "'456'"]
]
````

Then the Ao (Javascript) engine executes these instructions and prints:

```
123 456
```

### Arithmatics

Ao supports operations like `+ - * / %` as well as `==` for checking equality and `=` for variable (constant) declaration.

```scheme
(print (* 2 3 4))
```

This translates to:

```javascript
[ "print", [ "multiply", 2, 3, 4 ] ]
```

```
24
```

### Control flow — Conditionals

Only `if-else` syntax is implemented as of now. For more complex `if-elseif-elseif-...-else`, code needs to be nested under `if-else` at the moment.

```scheme
((defun cube (x) 
	(* x x x))
 (if (== (cube -3) -27)
	((print (cube -3))
	 (print 'Correct! :)'))
	((print (cube -3))
	 (print 'Incorrect :('))))
```

```javascript
[
    ["defun", "cube", ["x"],
        ["multiply", "x", "x", "x"]
    ],
    ["if", ["equals", ["cube", -3], -27],
        [
            ["print", ["cube", -3]],
            ["print", "'Correct! :)'"]
        ],
        [
            ["print", ["cube", -3]],
            ["print", "'Incorrect :('"]
        ]
    ]
]
```

```
-27
Correct! :)
```

### Control flow — Loop

For now, only a range loop is possible, as `for-each`. Since there is no variable while loop for now, infinite looping is not possible. This is under design and development at the moment.

Let's look at a range iteration:

```scheme
((defun cube (x)
	(* x x x))
 (defun print-cube (x)
	(print (cube x)))
 (for-each (range -2 2) print-cube))
```

The above translates to

```javascript
[
    ["defun", "cube", ["x"],
        ["multiply", "x", "x", "x"]
    ],
    ["defun", "print_cube", ["x"],
        ["print", ["cube", "x"]]
    ],
    ["for_each", ["range", -2, 2], "print_cube"]
]
````

Which prints:

```
-8
-1
0
1
8
```

As a functional language, Ao fundementally supports tail recursion as a form of looping. But it's usually blocked at around 700 iterations by the Javascript engine, due to overuse of the stack by the current implementation of the Ao engine.

```scheme
((defun rec-fn (txt count)
 	(if (== count 700)
 		(print 'done')
 		((print (~ txt ' ' count))
 		 (rec-fn (~ count ' + ' 1 ' =') (+ count 1)))))
 (rec-fn 'starting' 0))
 ```
 
 ```javascript
 [
    ["defun", "rec_fn", ["txt", "count"],
        ["if", ["equals", "count", 700],
            ["print", "'done'"],
            [
                ["print", ["concat", "txt", "' '", "count"]],
                ["rec_fn", ["concat", "count", "' + '", 1, "' ='"],
                    ["add", "count", 1]
                ]
            ]
        ]
    ],
    ["rec_fn", "'starting'", 0]
]
 ```
 
 ```
starting 0
0 + 1 = 1
1 + 1 = 2
2 + 1 = 3
3 + 1 = 4
4 + 1 = 5
...
696 + 1 = 697
697 + 1 = 698
698 + 1 = 699
done
 ```

## Plans

This is not yet complete. To make Ao more like Lisp, and give it its full potential with metaprogramming (code changing itself), array/list manipulation methods are needed. I'm working on adding these, as well as optimizing and simplifying the source code of Ao.

~I am also planning on creating a CLI version of Ao, available on npm and GitHub npm, though the language so far has no practical ability to be used like that.~

Recursion is limited to around 700 iterations due to stack limitations and inefficiency of this implementation of Ao.

Feel free to add your suggestions and feedback as issues. I'd love to discuss about the philosophy of Lisp and metaprogramming as well as any short-sight I may be making.
