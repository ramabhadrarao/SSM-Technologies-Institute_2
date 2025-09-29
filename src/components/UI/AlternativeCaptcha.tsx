// src/components/UI/AlternativeCaptcha.tsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface AlternativeCaptchaProps {
  onVerify: (isValid: boolean, answer?: string) => void;
  type?: 'math' | 'slider' | 'puzzle' | 'text' | 'image' | 'time';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface AlternativeCaptchaRef {
  reset: () => void;
}

// 1. MATH CAPTCHA
const MathCaptcha: React.FC<{
  onVerify: (isValid: boolean, answer?: string) => void;
  difficulty: string;
}> = ({ onVerify, difficulty }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const generateQuestion = () => {
    let num1, num2, operator, result;
    
    if (difficulty === 'easy') {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operator = Math.random() > 0.5 ? '+' : '-';
      result = operator === '+' ? num1 + num2 : num1 - num2;
    } else if (difficulty === 'medium') {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      const ops = ['+', '-', '*'];
      operator = ops[Math.floor(Math.random() * ops.length)];
      result = operator === '+' ? num1 + num2 : operator === '-' ? num1 - num2 : num1 * num2;
    } else {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      const ops = ['+', '-', '*'];
      operator = ops[Math.floor(Math.random() * ops.length)];
      result = operator === '+' ? num1 + num2 : operator === '-' ? num1 - num2 : num1 * num2;
    }

    setQuestion(`${num1} ${operator} ${num2} = ?`);
    setCorrectAnswer(result);
    setUserAnswer('');
    setStatus('idle');
  };

  useEffect(() => {
    generateQuestion();
  }, [difficulty]);

  const handleVerify = () => {
    const isCorrect = parseInt(userAnswer) === correctAnswer;
    setStatus(isCorrect ? 'correct' : 'incorrect');
    onVerify(isCorrect, userAnswer);
    
    if (!isCorrect) {
      setTimeout(generateQuestion, 1500);
    }
  };

  return (
    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          Solve this math problem:
        </label>
        <button
          type="button"
          onClick={generateQuestion}
          className="text-blue-600 hover:text-blue-800 p-1"
          title="Generate new question"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex-1 bg-white border-2 border-gray-300 rounded-lg p-3 text-center text-lg font-mono font-bold text-gray-900">
          {question}
        </div>
        
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
          className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-mono text-lg"
          placeholder="?"
        />
        
        <button
          type="button"
          onClick={handleVerify}
          disabled={!userAnswer}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Check
        </button>
      </div>
      
      {status === 'correct' && (
        <div className="mt-2 flex items-center text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-1" />
          Correct! You are verified.
        </div>
      )}
      
      {status === 'incorrect' && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <XCircle className="w-4 h-4 mr-1" />
          Incorrect. Try the new question.
        </div>
      )}
    </div>
  );
};

// 2. SLIDER CAPTCHA
const SliderCaptcha: React.FC<{
  onVerify: (isValid: boolean) => void;
}> = ({ onVerify }) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [startTime] = useState(Date.now());

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    
    // Must take at least 0.5 seconds (prevent bots)
    const timeTaken = Date.now() - startTime;
    
    if (value === 100 && timeTaken > 500) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setIsVerified(false);
      onVerify(false);
    }
  };

  return (
    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
      <label className="text-sm font-medium text-gray-700 mb-3 block">
        Slide to verify you're human:
      </label>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full h-12 appearance-none bg-gradient-to-r from-gray-300 via-blue-400 to-green-500 rounded-lg cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${sliderValue}%, #d1d5db ${sliderValue}%, #d1d5db 100%)`
          }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white font-semibold text-sm drop-shadow-lg">
            {sliderValue === 100 ? '✓ Verified' : `Slide to ${100 - sliderValue}%`}
          </span>
        </div>
      </div>
      
      {isVerified && (
        <div className="mt-2 flex items-center text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-1" />
          Successfully verified!
        </div>
      )}
    </div>
  );
};

// 3. PUZZLE CAPTCHA
const PuzzleCaptcha: React.FC<{
  onVerify: (isValid: boolean) => void;
}> = ({ onVerify }) => {
  const [pieces, setPieces] = useState<number[]>([]);
  const [selectedPieces, setSelectedPieces] = useState<number[]>([]);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    resetPuzzle();
  }, []);

  const resetPuzzle = () => {
    // Create shuffled array of numbers 1-9
    const shuffled = Array.from({ length: 9 }, (_, i) => i + 1)
      .sort(() => Math.random() - 0.5);
    setPieces(shuffled);
    setSelectedPieces([]);
    setIsVerified(false);
    onVerify(false);
  };

  const handlePieceClick = (piece: number) => {
    if (selectedPieces.includes(piece)) {
      setSelectedPieces(selectedPieces.filter(p => p !== piece));
    } else {
      const newSelected = [...selectedPieces, piece];
      setSelectedPieces(newSelected);
      
      // Check if correct order (1-9)
      if (newSelected.length === 9) {
        const isCorrect = newSelected.every((num, idx) => num === idx + 1);
        setIsVerified(isCorrect);
        onVerify(isCorrect);
        
        if (!isCorrect) {
          setTimeout(resetPuzzle, 1500);
        }
      }
    }
  };

  return (
    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          Click numbers in order (1-9):
        </label>
        <button
          type="button"
          onClick={resetPuzzle}
          className="text-blue-600 hover:text-blue-800 p-1"
          title="Reset puzzle"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {pieces.map((piece, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePieceClick(piece)}
            disabled={isVerified}
            className={`h-16 text-2xl font-bold rounded-lg transition-all ${
              selectedPieces.includes(piece)
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } ${isVerified ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {piece}
          </button>
        ))}
      </div>
      
      <div className="mt-3 text-center text-sm text-gray-600">
        Selected: {selectedPieces.length}/9
      </div>
      
      {isVerified && (
        <div className="mt-2 flex items-center justify-center text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-1" />
          Puzzle solved correctly!
        </div>
      )}
    </div>
  );
};

// 4. TEXT CAPTCHA (Type what you see)
const TextCaptcha: React.FC<{
  onVerify: (isValid: boolean) => void;
}> = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setUserInput('');
    setIsVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = () => {
    const isCorrect = userInput.toUpperCase() === captchaText;
    setIsVerified(isCorrect);
    onVerify(isCorrect);
    
    if (!isCorrect) {
      setTimeout(generateCaptcha, 1500);
    }
  };

  return (
    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
      <label className="text-sm font-medium text-gray-700 mb-3 block">
        Type the characters you see:
      </label>
      
      <div className="flex items-center space-x-3">
        <div className="flex-1 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-gray-400 rounded-lg p-4 text-center relative overflow-hidden">
          <div 
            className="text-3xl font-bold tracking-widest select-none"
            style={{
              fontFamily: 'monospace',
              transform: 'skew(-5deg)',
              letterSpacing: '8px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {captchaText.split('').map((char, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  transform: `rotate(${(Math.random() - 0.5) * 20}deg)`,
                  color: `hsl(${Math.random() * 360}, 70%, 40%)`
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
        
        <button
          type="button"
          onClick={generateCaptcha}
          className="text-blue-600 hover:text-blue-800 p-2"
          title="Generate new code"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center space-x-3 mt-3">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="Enter code"
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg uppercase text-center tracking-widest font-mono"
          maxLength={6}
        />
        
        <button
          type="button"
          onClick={handleVerify}
          disabled={userInput.length !== 6}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Verify
        </button>
      </div>
      
      {isVerified && (
        <div className="mt-2 flex items-center text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-1" />
          Code verified successfully!
        </div>
      )}
    </div>
  );
};

// 5. TIME-BASED CAPTCHA (Click when timer reaches zero)
const TimeCaptcha: React.FC<{
  onVerify: (isValid: boolean) => void;
}> = ({ onVerify }) => {
  const [countdown, setCountdown] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [canClick, setCanClick] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (isActive && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanClick(true);
      setTimeout(() => {
        if (!isVerified) {
          reset();
        }
      }, 3000);
    }
  }, [isActive, countdown, isVerified]);

  const reset = () => {
    setCountdown(5);
    setIsActive(false);
    setCanClick(false);
    setIsVerified(false);
    onVerify(false);
  };

  const handleStart = () => {
    setIsActive(true);
    setIsVerified(false);
    onVerify(false);
  };

  const handleClick = () => {
    if (canClick && countdown === 0) {
      setIsVerified(true);
      onVerify(true);
    }
  };

  return (
    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
      <label className="text-sm font-medium text-gray-700 mb-3 block">
        Click the button when countdown reaches 0:
      </label>
      
      <div className="text-center">
        {!isActive && !isVerified ? (
          <button
            type="button"
            onClick={handleStart}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Start Timer
          </button>
        ) : (
          <div className="space-y-3">
            <div className={`text-6xl font-bold ${
              countdown === 0 ? 'text-green-600' : 'text-gray-700'
            }`}>
              {countdown}
            </div>
            
            <button
              type="button"
              onClick={handleClick}
              disabled={!canClick || isVerified}
              className={`w-full px-6 py-4 rounded-lg font-semibold ${
                canClick && !isVerified
                  ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isVerified ? '✓ Verified' : canClick ? 'Click Now!' : 'Wait...'}
            </button>
            
            {isVerified && (
              <div className="flex items-center justify-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Perfect timing! You are verified.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const AlternativeCaptcha = forwardRef<AlternativeCaptchaRef, AlternativeCaptchaProps>(
  ({ onVerify, type = 'math', difficulty = 'medium' }, ref) => {
    const [key, setKey] = useState(0);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setKey(prev => prev + 1);
        onVerify(false);
      }
    }));

    const captchaComponents = {
      math: <MathCaptcha key={key} onVerify={onVerify} difficulty={difficulty} />,
      slider: <SliderCaptcha key={key} onVerify={onVerify} />,
      puzzle: <PuzzleCaptcha key={key} onVerify={onVerify} />,
      text: <TextCaptcha key={key} onVerify={onVerify} />,
      time: <TimeCaptcha key={key} onVerify={onVerify} />
    };

    return captchaComponents[type] || captchaComponents.math;
  }
);

AlternativeCaptcha.displayName = 'AlternativeCaptcha';

export default AlternativeCaptcha;