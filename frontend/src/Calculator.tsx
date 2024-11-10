// frontend/src/Calculator.tsx

import React, { useState } from 'react';
import axios from 'axios';

const Calculator: React.FC = () => {
    const [expression, setExpression] = useState<string>('');
    const [result, setResult] = useState<number | string | null>(null);
    const [variables, setVariables] = useState<{ [key: string]: number }>({});
    const [showSlider, setShowSlider] = useState<{ [key: string]: boolean }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExpression(e.target.value);
    };

    const handleVariableSliderChange = (varName: string, value: number) => {
        setVariables(prevVars => ({ ...prevVars, [varName]: value }));
    };

    const handleCalculate = async () => {
        try {
            const response = await axios.post('http://localhost:3001/calculate', { expression, variables });
            setResult(response.data.result);
        } catch (error) {
            setResult('Error: Invalid expression');
        }
    };

    // Check for variables in the expression (detects any letter, case sensitive)
    const detectVariables = (expr: string) => {
        const variablePattern = /\b[a-zA-Z]\b/g;  // Detects any single alphabetic character (case-sensitive)
        const foundVariables = expr.match(variablePattern);
        if (foundVariables) {
            const uniqueVariables = Array.from(new Set(foundVariables));
            return uniqueVariables;
        }
        return [];
    };

    // Show sliders for variables
    const variablesInExpression = detectVariables(expression);

    // Function to remove a slider
    const handleRemoveSlider = (varName: string) => {
        setShowSlider((prev) => {
            const newShowSlider = { ...prev };
            delete newShowSlider[varName]; // Remove slider visibility for that variable
            return newShowSlider;
        });
        setVariables((prevVars) => {
            const newVars = { ...prevVars };
            delete newVars[varName]; // Remove the variable from the state
            return newVars;
        });
    };

    return (
        <div className="container mx-auto p-8 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Calculator</h1>
            <input
                type="text"
                value={expression}
                onChange={handleInputChange}
                placeholder="Enter expression"
                className="w-full p-2 border rounded"
            />
            {variablesInExpression.length > 0 && (
                <div className="mt-4">
                    {variablesInExpression.map((varName) => (
                        <div key={varName} className="flex items-center mb-2">
                            {!showSlider[varName] && (
                                <button
                                    onClick={() => setShowSlider((prev) => ({ ...prev, [varName]: !prev[varName] }))}
                                    className="mr-2 bg-blue-500 text-white p-2 rounded"
                                >
                                    Add Slider for {varName}
                                </button>
                            )}
                            {showSlider[varName] && (
                                <div className="w-full p-4 bg-gray-100 rounded flex items-center justify-between">
                                    <div className="flex items-center">
                                        <label>{varName}</label>
                                        <input
                                            type="range"
                                            min="-10"
                                            max="10"
                                            step="0.1"
                                            value={variables[varName] || 0}
                                            onChange={(e) => handleVariableSliderChange(varName, parseFloat(e.target.value))}
                                            className="w-full mt-2 mx-2"
                                        />
                                        <span>{variables[varName] || 0}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveSlider(varName)}
                                        className="text-red-500 text-xl"
                                    >
                                        X
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <button
                onClick={handleCalculate}
                className="w-full mt-4 bg-blue-500 text-white p-2 rounded"
            >
                Calculate
            </button>
            {result !== null && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <strong>Result:</strong> {result}
                </div>
            )}
        </div>
    );
};

export default Calculator;
