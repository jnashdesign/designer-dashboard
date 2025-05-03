import React, { useState, useRef, useEffect } from 'react';
import { questionSuggestions } from '../data/questionSuggestions';

export default function AutocompleteInput({ value, onChange, type = 'text', suggestions = [] }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Filter suggestions based on input value
    if (value) {
      const filtered = suggestions.filter(
        suggestion => suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(suggestions);
    }
  }, [value, suggestions]);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="position-relative" style={{ width: '100%' }}>
      {type === 'textarea' ? (
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          className="form-control"
          rows="3"
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleInputFocus}
          className="form-control"
        />
      )}
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="suggestions-dropdown"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 