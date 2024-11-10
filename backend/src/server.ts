import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import RecursiveDescentParser from './parser';

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from 'backend/public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API route to handle the calculation request
app.post('/calculate', (req: any, res: any) => {
    const { expression, variables } = req.body;  // Accept variables from frontend
    if (typeof expression !== 'string') {
        return res.status(400).json({ error: 'Expression must be a string' });
    }

    try {
        const parser = new RecursiveDescentParser(expression, variables);
        const ast = parser.parseExpression();
        const result = parser.evaluate(ast);
        res.json({ result });
    } catch (error) {
        res.status(400).json({ error: 'Invalid expression' });
    }
});

// Fallback route to serve index.html for all non-API requests (frontend)
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));

