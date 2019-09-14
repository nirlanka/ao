(function () {

const __inp = `
((defun foo (a b) 
	(* a b))
(print (foo 2 3))
(defun bar (a b c) (foo
	(foo a b)
	c))
(print (bar 4 5 6))
(defun test (txt)
	(print (~ txt ' ' txt)))
(test 'haha')
(defun test2 (txt)
	(~ txt ' ' txt))
(print (test2 'haha'))
(print (1 2 3))
(print (* 333 11))
(defun handle-nums (a b)
	(if (== a b) (print 'equal') (print 'not equal')))
(handle-nums 20 '20')
(handle-nums 20 -20)
(handle-nums 20 20)
(defun foo (x) 
	(print (* x x x)))
(for-each (range -5 5) 
	foo)
(for-each (3 4 5) 
	(print 'haha'))
(print (~ 'a' 'b'))
(print true)
(= myfun ((defun abc (x) (print (~ x x x x x)))))
(print myfun)
(for-each (range 1 4) 
	((defun print-range (x)
		(print x))
	(print-range 'haha')))
(print))
`

let inp = JSON.parse(
	__inp
	.trim()
	.replace(/\(\+\s(?=([^']*'[^']*')*[^']*$)/g, '(add ')
	.replace(/\(\-\s(?=([^']*'[^']*')*[^']*$)/g, '(substract ')
	.replace(/\(\*\s(?=([^']*'[^']*')*[^']*$)/g, '(multiply ')
	.replace(/\(\/\s(?=([^']*'[^']*')*[^']*$)/g, '(divide ')
	.replace(/\(\%\s(?=([^']*'[^']*')*[^']*$)/g, '(remainder ')
	.replace(/\(==\s(?=([^']*'[^']*')*[^']*$)/g, '(equals ')
	.replace(/\(=\s(?=([^']*'[^']*')*[^']*$)/g, '(assign ')
	.replace(/\(~\s(?=([^']*'[^']*')*[^']*$)/g, '(concat ')
	.replace(/\s+(?=([^']*'[^']*')*[^']*$)/g, ' ') // clean all redundant not in strings
	.replace(/(\w+\-\w+)(?=([^']*'[^']*')*[^']*$)/g, (match, capture) => match.replace(/-/g, '_')) // replace '-' with '_' in names
	.replace(/\b([^\d\W]+)([0-9]*)\b|\'([^\']*)\'/g, (match, capture) => '"' + match + '",') // cover all words with quotes and commas
	.replace(/\@\"(?=([^']*'[^']*')*[^']*$)/g, '"@') // move '@' inside id string // TODO: Remove (not used)
	.replace(/\d+(?=([^']*'[^']*')*[^']*$)/g, (match, capture) => match + ',') // add commas to digits
	.replace(/\((?=([^']*'[^']*')*[^']*$)/g, '[') // replace parens...
	.replace(/\)(?=([^']*'[^']*')*[^']*$)/g, '],') // replace parens.
	.replace(/\], \](?=([^']*'[^']*')*[^']*$)/g, '] ]') // remove trailing commas...
	.replace(/,\](?=([^']*'[^']*')*[^']*$)/g, ']') // remove trailing commas.
	.slice(0, -1) // remove final trailing comma at the end
	.replace(/"true"(?=([^']*'[^']*')*[^']*$)/g, 'true')
	.replace(/"false"(?=([^']*'[^']*')*[^']*$)/g, 'false')
)

// console.log(inp)

let has_crashed = false

const keywords = [ 'defun', 'if', 'for_each' ]

function is_keyword(key) {
	return keywords.some(x => x === key)
}

const std_funs = {
	defun: (args, context, upper_context, scope, upper_scope) => {
		context[args[0]] = create_fun(args[1], args[2], context, upper_context, scope, upper_scope)
	},

	assign: (args, context, upper_context, scope, upper_scope) => {
		if ((typeof args[0]) !== 'string' ||
			args[0][0] === "'" ||
			args[0][-1] === "'"
		) {
			has_crashed = true
			console.error(`ERROR: <${args[0]}> is not a valid variable name.`)
		} else {
			scope[args[0]] = args[1]
			return args[1]
		}
	},

	equals: (args, context, upper_context, scope, upper_scope) => args[0] === args[1],
	if: (args, context, upper_context, scope, upper_scope) => {
		const condition_value = run(args[0], context, upper_context, scope, upper_scope)

		if (condition_value) {
			return run(
				args[1], 
				{}, 
				Object.assign({}, upper_context, context), 
				{}, 
				Object.assign({}, upper_scope, scope)
			)
		} else {
			return run(
				args[2], 
				{}, 
				Object.assign({}, upper_context, context), 
				{}, 
				Object.assign({}, upper_scope, scope)
			)
		}
	},

	range: (args, context, upper_context, scope, upper_scope) => {
		const start = (args.length > 1) ? args[0] : 0
		const end = (args.length > 1) ? args[1] : args[0]
		const gap = args[2] || 1

		return Array((end + 1) - start).fill(undefined).map((n, i) => start + (i - 1) + gap)
	},
	for_each: (args, context, upper_context, scope, upper_scope) => {
		const list = run(args[0], context, upper_context, scope, upper_scope)

		if (Array.isArray(args[1])) {
			return list.map(x => run(args[1], context, upper_context, scope, upper_scope))
		} else if ((typeof args[1]) == 'string') {
			const fn = ((context[args[1]] !== undefined) ? (context[args[1]]) : (upper_context[args[1]]))

			return list.map(x => fn([x], context, upper_context, scope, upper_scope))
		}
	},

	print: (args, context, upper_context, scope, upper_scope) => {
		const _args = args.map(s => ((typeof s) === 'string') ? (s.slice(1, -1)) : (s))
		console.log(..._args)
	},

	multiply: (args, context, upper_context, scope, upper_scope) => args.reduce((a,b) => a * b, 1),
	divide: (args, context, upper_context, scope, upper_scope) => args[0] / args[1],
	add: (args, context, upper_context, scope, upper_scope) => args.reduce((a,b) => a + b, 0),
	substract: (args, context, upper_context, scope, upper_scope) => args.reduce((a,b) => a + b, 0),
	remainder: (args, context, upper_context, scope, upper_scope) => args[0] % args[1],
	
	concat: (args, context, upper_context, scope, upper_scope) => "'" + args.join("").replace(/'/g, '') + "'"
}

function create_fun(fun_args, code, context, upper_context, scope, upper_scope) {
	return function (calling_args) {
		let _scope = {}
		fun_args.forEach((fun_arg, i) => _scope[fun_arg] = calling_args[i])
		_scope = Object.assign({}, scope, _scope)

		return run(
			code, 
			{}, 
			Object.assign({}, upper_context, context), 
			_scope, 
			Object.assign({}, upper_scope, _scope)
		)
	}
}

function run(code, context, upper_context, scope, upper_scope) {
	if (has_crashed) {
		return
	}

	if (!Array.isArray(code[0])) {
		if (!Array.isArray(code)) {
			return code
		} else {
			const fn = context[code[0]] || upper_context[code[0]]

			const args = code.slice(1).map(arg => {
				let _run_result

				const val = 
					(scope[arg] !== undefined) ? scope[arg] : (
						(upper_scope[arg] !== undefined) ? upper_scope[arg] : (
							(!is_keyword(code[0]) && (undefined !== (_run_result = run(arg, context, upper_context, scope, upper_scope)))) ? _run_result : arg))

				return val
			})

			return (fn) ? fn(args, context, upper_context, scope, upper_scope) : code
		}
	} else {
		for (const line of code) {
			run(line, context, upper_context, scope, upper_scope)
		}
	}
}

run(inp, {}, std_funs, {}, {})

})()