"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const parser_1 = __importDefault(require("./parser"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files from 'backend/public' directory
app.use(express_1.default.static('public'));
// API route to handle the calculation request
app.post('/calculate', (req, res) => {
    const { expression, variables } = req.body; // Accept variables from frontend
    if (typeof expression !== 'string') {
        return res.status(400).json({ error: 'Expression must be a string' });
    }
    try {
        const parser = new parser_1.default(expression, variables);
        const ast = parser.parseExpression();
        const result = parser.evaluate(ast);
        res.json({ result });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid expression' });
    }
});
// Fallback route to serve index.html for all non-API requests (frontend)
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
app.listen(3001, () => console.log('Server running on http://localhost:3001'));
