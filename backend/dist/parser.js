"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RecursiveDescentParser {
    constructor(input, variables) {
        this.tokens = this.tokenize(input);
        this.variables = variables;
        this.currentTokenIndex = 0;
    }
    tokenize(input) {
        const tokenPattern = /\d+(\.\d+)?|[+*/^()-]|\b(sin|cos|tan|asin|acos|atan|cot|sec|csc|sqrt|ln|exp|pi|e)\b/g;
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
        // Handle functions like sin, cos, etc.
        if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'cot', 'sec', 'csc', 'sqrt', 'ln', 'exp'].includes(token)) {
            const func = this.consume();
            if (this.consume() !== '(') {
                throw new Error(`Expected '(' after function ${func}`);
            }
            const node = this.parseExpression();
            if (this.consume() !== ')') {
                throw new Error(`Expected ')' after function argument in ${func}`);
            }
            return [func, node];
        }
        // Handle constants like pi and e
        if (token === 'pi') {
            this.consume();
            return Math.PI;
        }
        else if (token === 'e') {
            this.consume();
            return Math.E;
        }
        // Handle numbers
        if (/\d+(\.\d+)?/.test(token)) {
            return parseFloat(this.consume());
        }
        // Handle variables
        if (/[a-zA-Z]/.test(token)) {
            const varName = this.consume();
            if (this.variables.hasOwnProperty(varName)) {
                return { type: 'variable', name: varName };
            }
            throw new Error(`Unknown variable: ${varName}`);
        }
        // Handle expressions in parentheses
        if (token === '(') {
            this.consume(); // consume '('
            const node = this.parseExpression();
            if (this.consume() !== ')') {
                throw new Error("Expected ')'");
            }
            return node;
        }
        throw new Error(`Unexpected token: ${token}`);
    }
    evaluate(node) {
        if (typeof node === 'number')
            return node;
        if ('type' in node && node.type === 'variable') {
            return this.variables[node.name];
        }
        if (Array.isArray(node)) {
            const [op, left, right] = node;
            if (right === undefined) { // Unary operator
                const leftVal = this.evaluate(left);
                switch (op) {
                    case 'sin': return Math.sin(leftVal);
                    case 'cos': return Math.cos(leftVal);
                    case 'tan': return Math.tan(leftVal);
                    case 'asin': return Math.asin(leftVal);
                    case 'acos': return Math.acos(leftVal);
                    case 'atan': return Math.atan(leftVal);
                    case 'cot': return 1 / Math.tan(leftVal);
                    case 'sec': return 1 / Math.cos(leftVal);
                    case 'csc': return 1 / Math.sin(leftVal);
                    case 'sqrt': return Math.sqrt(leftVal);
                    case 'ln': return Math.log(leftVal);
                    case 'exp': return Math.exp(leftVal);
                    default: throw new Error(`Unknown operator: ${op}`);
                }
            }
            else { // Binary operator
                const leftVal = this.evaluate(left);
                const rightVal = this.evaluate(right);
                switch (op) {
                    case '+': return leftVal + rightVal;
                    case '-': return leftVal - rightVal;
                    case '*': return leftVal * rightVal;
                    case '/': return leftVal / rightVal;
                    case '^': return Math.pow(leftVal, rightVal);
                    default: throw new Error(`Unknown operator: ${op}`);
                }
            }
        }
        throw new Error("Invalid AST node");
    }
}
exports.default = RecursiveDescentParser;
