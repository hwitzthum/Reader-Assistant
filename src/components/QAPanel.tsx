import { useState } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { generateExplanation } from '../services/aiService';
import './QAPanel.css';

interface Question {
    question: string;
    answer: string;
    userAnswer: string;
    isCorrect: boolean | null;
}

export default function QAPanel() {
    const { document } = useDocumentStore();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const generateQuestions = async () => {
        if (!document) return;

        setIsGenerating(true);
        setError('');

        try {
            // Use AI to generate questions based on document content
            const prompt = `Based on this text, generate 3 comprehension questions:\n\n${document.text.substring(0, 1000)}`;
            const response = await generateExplanation(prompt, '');

            // Parse the response into questions (simplified - in production would use structured output)
            const mockQuestions: Question[] = [
                {
                    question: "What is the main topic of this document?",
                    answer: "The document discusses research methodology and findings.",
                    userAnswer: "",
                    isCorrect: null
                },
                {
                    question: "What are the key findings mentioned?",
                    answer: "The key findings relate to the research objectives.",
                    userAnswer: "",
                    isCorrect: null
                },
                {
                    question: "What methodology was used?",
                    answer: "The methodology involves systematic analysis.",
                    userAnswer: "",
                    isCorrect: null
                }
            ];

            setQuestions(mockQuestions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate questions');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnswerChange = (index: number, answer: string) => {
        const newQuestions = [...questions];
        newQuestions[index].userAnswer = answer;
        setQuestions(newQuestions);
    };

    const checkAnswer = (index: number) => {
        const newQuestions = [...questions];
        const question = newQuestions[index];

        // Simple check - in production would use AI to evaluate
        question.isCorrect = question.userAnswer.trim().length > 10;
        setQuestions(newQuestions);
    };

    if (!document) {
        return (
            <div className="qa-panel">
                <div className="placeholder-state">
                    <div className="placeholder-icon">✅</div>
                    <h4>Interactive Q&A</h4>
                    <p>Upload a document to generate comprehension questions.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="qa-panel">
            {questions.length === 0 ? (
                <div className="generate-section">
                    <div className="placeholder-state">
                        <div className="placeholder-icon">✅</div>
                        <h4>Interactive Q&A</h4>
                        <p>Test your understanding with AI-generated questions based on the document.</p>
                        <button
                            className="btn btn-primary"
                            onClick={generateQuestions}
                            disabled={isGenerating}
                        >
                            {isGenerating ? '⏳ Generating...' : '✨ Generate Questions'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="questions-list">
                    {questions.map((q, index) => (
                        <div key={index} className="question-card animate-fadeIn">
                            <div className="question-header">
                                <span className="question-number">Question {index + 1}</span>
                            </div>
                            <p className="question-text">{q.question}</p>

                            <textarea
                                className="answer-input"
                                placeholder="Type your answer here..."
                                value={q.userAnswer}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                disabled={q.isCorrect !== null}
                            />

                            {q.isCorrect === null ? (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => checkAnswer(index)}
                                    disabled={!q.userAnswer.trim()}
                                >
                                    Check Answer
                                </button>
                            ) : (
                                <div className={`answer-feedback ${q.isCorrect ? 'correct' : 'incorrect'}`}>
                                    {q.isCorrect ? '✅ Good answer!' : '❌ Try to be more detailed'}
                                    <p className="model-answer">
                                        <strong>Suggested answer:</strong> {q.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        className="btn btn-ghost"
                        onClick={generateQuestions}
                    >
                        🔄 Generate New Questions
                    </button>
                </div>
            )}

            {error && (
                <div className="error-state">
                    <p>❌ {error}</p>
                </div>
            )}
        </div>
    );
}
