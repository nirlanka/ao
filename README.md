凹 (Āo) 
=======

Ao is an attempt at creating a Lisp-like programming language with Javascript using a syntax tree built on Javascript arrays.

## Lisp?

Lisp is a list-based functional programming language where code and data both are represented as lists. This puts Lisp in a very special position: Lisp code can easily change itself. i.e. A program written in Lisp can re-arrange and change parts of it's own code, live!

On the other hand, Javascript employs one of the most dynamic and non-restrictive array structure. Therefore, I believed, with a bit of coding, it's possible to represent Lisp-like code with Javascript arrays.

When you run this Javascript file through NodeJS, or open the HTML file and look at the browser console, you will see that the execution happens on a Javascript array that was created from the original syntax.

## Plans

This is not yet complete. To make Ao more like Lisp, and give it its full potential with metaprogramming (code changing itself), array/list manipulation methods are needed. I'm working on adding these, as well as optimizing and simplifying the source code of Ao.

I am also planning on creating a CLI version of Ao, available on npm and GitHub npm, though the language so far has no practical ability to be used like that.

Feel free to add your suggestions and feedback as issues. I'd love to discuss about the philosophy of Lisp and metaprogramming as well as any short-sight I may be making.
