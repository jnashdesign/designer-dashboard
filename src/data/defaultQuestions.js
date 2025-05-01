export const defaultQuestions = [
  {
    id: 'group-business',
    name: 'Business Info',
    questions: [
      { id: 'question-b1', text: 'What is the name of your business or project?' },
      { id: 'question-b2', text: 'Describe what your business/product/service does.' },
      { id: 'question-b3', text: 'What problem are you solving for your customers or users?' },
    ]
  },
  {
    id: 'group-goals-values',
    name: 'Goals and Values',
    questions: [
      { id: 'question-b4', text: 'What are your short and long-term goals for this project?' },
      { id: 'question-b5', text: 'What does success look like for this project?' },
      { id: 'question-b6', text: 'Do you have an established mission statement or core values?' },
    ]
  },
  {
    id: 'group-audience-competitors',
    name: 'Audience and Competitors',
    questions: [
      { id: 'question-b7', text: 'Who is your primary target audience? (Age, gender, occupation, interests, tech-savviness, etc.)' },
      { id: 'question-b8', text: 'Who are your competitors, and how do you differ from them?' }
    ]
  }
];

// Check what your defaultQuestions look like
console.log('Default Questions:', defaultQuestions);