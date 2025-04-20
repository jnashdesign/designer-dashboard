import { useState } from 'react';
import wordSuggestions from '../../../data/wordBank';
import logoStyles from '../../../data/logoStyles';

export default function Step3({ next, back, update }) {
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [descriptiveWords, setDescriptiveWords] = useState(['', '', '', '', '']);

  const handleSubmit = () => {
    update({ selectedStyles, descriptiveWords });
    next();
  };

  return (
    <div>
      <h2>Let’s find your brand’s personality.</h2>

      <div>
        <p>Pick the words that best describe the style you're going for.</p>
        {logoStyles.map(style => (
          <label key={style}>
            <input
              type="checkbox"
              value={style}
              checked={selectedStyles.includes(style)}
              onChange={() => {
                setSelectedStyles(prev =>
                  prev.includes(style)
                    ? prev.filter(s => s !== style)
                    : [...prev, style]
                );
              }}
            />
            {style}
          </label>
        ))}
      </div>

      <div>
        <p>Pick 5 words you want customers to use to describe your brand.</p>
        {descriptiveWords.map((word, i) => (
          <input
            key={i}
            type="text"
            list="wordSuggestions"
            value={word}
            onChange={(e) => {
              const updated = [...descriptiveWords];
              updated[i] = e.target.value;
              setDescriptiveWords(updated);
            }}
          />
        ))}
        <datalist id="wordSuggestions">
          {wordSuggestions.map(word => <option key={word} value={word} />)}
        </datalist>
      </div>

      <button onClick={back}>Back</button>
      <button onClick={handleSubmit}>Next</button>
    </div>
  );
}