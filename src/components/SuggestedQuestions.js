import React from 'react';

const suggestedBank = [
  'What makes you different from competitors?',
  'Who is your target audience?',
  'What feeling should your brand convey?',
];

export default function SuggestedQuestions({ addQuestion }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>Suggested Questions</h3>
      {suggestedBank.map((q, idx) => (
        <button key={idx} onClick={() => addQuestion(q)} style={{ display: 'block', marginBottom: '0.5rem' }}>
          + {q}
        </button>
      ))}
    </div>
  );
}