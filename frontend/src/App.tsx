// frontend/src/App.tsx
import React from 'react';
import Calculator from './Calculator';

const App: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <Calculator />
        </div>
    );
};

export default App;
