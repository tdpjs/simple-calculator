"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RecursiveDescentParser {
    constructor(input, variables) {
        this.tokens = this.tokenize(input);
        this.variables = variables;
        this.currentTokenIndex = 0;
    }
    tokenize(input) {
        const tokenPattern = /\d+(\.\d+)?|[+*/^()-]|\b(sin|cos|tan|asin|acos|atan|atan2|cot|sec|csc|acot|asec|acsc|sqrt|log_\d+|ln|exp)\b|\b(pi|e|[a-zA-Z])\b/g;
        return input.match(tokenPattern) || [];
    }
    consume() {
        return this.tokens[this.currentTokenIndex++];
    }
    peek() {
        return this.tokens[this.currentTokenIndex];
    }
    parseExpression() {
        let node = this.parseTerm();
        while (this.peek() === '+' || this.peek() === '-') {
            const op = this.consume();
            const right = this.parseTerm();
            node = [op, node, right];
        }
        return node;
    }
    parseTerm() {
        let node = this.parseFactor();
        while (this.peek() === '*' || this.peek() === '/') {
            const op = this.consume();
            const right = this.parseFactor();
            node = [op, node, right];
        }
        return node;
    }
    parseFactor() {
        return this.parseExponent();
    }
    parseExponent() {
        let node = this.parsePrimary();
        while (this.peek() === '^') {
            const op = this.consume();
            const right = this.parseExponent();
            node = [op, node, right];
        }
        return node;
    }
    parsePrimary() {
        const token = this.peek();
        if (/[a-zA-Z]/.test(token)) {
            const varName = this.consume();
            if (this.variables.hasOwnProperty(varName)) {
                return { type: 'variable', name: varName };
            }
        }
        if (token === '-') {
            // Lookahead to handle unary negation (e.g., "-2" or "(-2)")
            this.consume(); // consume '-'
            const nextToken = this.peek();
            if (/\d+(\.\d+)?/.test(nextToken)) {
                return -parseFloat(this.consume());
            }
            else if (nextToken === '(') {
                this.consume(); // consume '('
                const node = this.parseExpression();
                this.consume(); // consume ')'
                return ['-', node]; // Unary negation
            }
        }
        if (/\d+(\.\d+)?/.test(token)) {
            return parseFloat(this.consume());
        }
        else if (token === '(') {
            this.consume();
            const node = this.parseExpression();
            this.consume(); // consume ')'
            return node;
            // } else if (token.startsWith('log_')) {
            //     const base: number = parseFloat(token.slice(4)); // Extract the base number after "log_"
            //     console.log(`log_x(y) detected with base: ${base}`);
            //     this.consume(); // consume 'log_x'
            //     this.consume(); // consume '('
            //     const node = this.parseExpression();
            //     console.log('Parsed right operand for log:', node);
            //     this.consume(); // consume ')'
            //     return ['log', base, node]; // log base 'x' and number 'y'
            // } else if (token === 'atan2') {
            //     console.log('Parsing atan2 function');
            //     this.consume(); // consume 'atan2'
            //     this.consume(); // consume '('
            //     const left = this.parseExpression(); // parse left operand
            //     console.log('Parsed left operand for atan2:', left);
            //     const right = this.parseExpression(); // parse right operand
            //     console.log('Parsed right operand for atan2:', right);
            //     this.consume(); // consume ')'
            //     return ['atan2', left, right]; // atan2 with both operands
        }
        else if (token === 'pi') {
            this.consume();
            return Math.PI;
        }
        else if (token === 'e') {
            this.consume();
            return Math.E;
        }
        else if (token === 'sqrt') {
            this.consume();
            this.consume(); // consume '('
            const node = this.parseExpression();
            this.consume(); // consume ')'
            return ['sqrt', node]; // unary operator
        }
        else if (token === 'sin' || token === 'cos' || token === 'tan' ||
            token === 'asin' || token === 'acos' || token === 'atan' ||
            token === 'cot' || token === 'sec' || token === 'acsc' ||
            token === 'csc' || token === 'acot' || token === 'asec') {
            const func = this.consume();
            this.consume(); // consume '('
            const node = this.parseExpression();
            this.consume(); // consume ')'
            return [func, node]; // unary operator
        }
        else if (token === 'ln') {
            this.consume(); // consume 'ln'
            this.consume(); // consume '('
            const node = this.parseExpression();
            this.consume(); // consume ')'
            return ['ln', node]; // natural log
        }
        else if (token === 'exp') {
            this.consume(); // consume 'exp'
            this.consume(); // consume '('
            const node = this.parseExpression();
            this.consume(); // consume ')'
            return ['exp', node]; // exponential function
        }
        throw new Error("Unexpected token");
    }
    evaluate(node) {
        if (typeof node === 'number')
            return node;
        if ('type' in node && node.type === 'variable') {
            return this.variables[node.name];
        }
        if (Array.isArray(node)) {
            const [op, left, right] = node;
            if (right === undefined) { // unary operator
                const leftVal = this.evaluate(left);
                switch (op) {
                    case 'sqrt': return Math.sqrt(leftVal);
                    case 'sin': return Math.sin(leftVal);
                    case 'cos': return Math.cos(leftVal);
                    case 'tan': return Math.tan(leftVal);
                    case 'asin': return Math.asin(leftVal);
                    case 'acos': return Math.acos(leftVal);
                    case 'atan': return Math.atan(leftVal);
                    case 'cot': return 1 / Math.tan(leftVal);
                    case 'sec': return 1 / Math.cos(leftVal);
                    case 'csc': return 1 / Math.sin(leftVal);
                    case 'acot': return Math.PI / 2 - Math.atan(leftVal); // acot(x) = π/2 - atan(x)
                    case 'asec': return Math.acos(1 / leftVal); // asec(x) = acos(1/x)
                    case 'acsc': return Math.asin(1 / leftVal); // acsc(x) = asin(1/x)
                    case 'ln': return Math.log(leftVal); // natural log
                    case 'exp': return Math.exp(leftVal); // exponential
                    case '-': return -leftVal; // unary negation
                    default: throw new Error("Unknown operator");
                }
            }
            else { // binary operator
                console.log("BINARY");
                const leftVal = this.evaluate(left);
                const rightVal = this.evaluate(right);
                console.log(leftVal);
                console.log(rightVal);
                console.log(Math.log(rightVal) / Math.log(leftVal));
                switch (op) {
                    case '+': return leftVal + rightVal;
                    case '-': return leftVal - rightVal;
                    case '*': return leftVal * rightVal;
                    case '/': return leftVal / rightVal;
                    case '^': return Math.pow(leftVal, rightVal);
                    // case 'atan2': return Math.atan2(leftVal, rightVal); // fix for two arguments
                    // case 'log': return Math.log(rightVal) / Math.log(leftVal); // log base 'x' of 'y'
                    default: throw new Error("Unknown operator");
                }
            }
        }
        return 0;
    }
}
exports.default = RecursiveDescentParser;
