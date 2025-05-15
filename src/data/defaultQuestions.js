export const defaultQuestions = [
  {
    id: 'group-business',
    name: 'Business Info',
    questions: [
      { 
        id: 'question-b1', 
        text: 'What is the name of your business or project?',
        type: 'textarea',
        accept: undefined,
        fileUrl: null
      },
      { 
        id: 'question-b2', 
        text: 'Describe what your business/product/service does.',
        type: 'textarea',
        accept: undefined,
        fileUrl: null
      },
      { 
        id: 'question-b3', 
        text: 'What problem are you solving for your customers or users?',
        type: 'textarea',
        accept: undefined,
        fileUrl: null
      },
    ]
  },
  {
    id: 'group-goals-values',
    name: 'Goals and Values',
    questions: [
      { 
        id: 'question-b4', 
        text: 'What are your short and long-term goals for this project?',
        type: 'textarea',
        accept: undefined,
        fileUrl: null
      },
      { 
        id: 'question-b5', 
        text: 'What does success look like for this project?',
        type: 'textarea',
        accept: undefined,
        fileUrl: null
      },
      { 
        id: 'question-b6', 
        text: 'Do you have an established mission statement or core values?',
        type: 'textarea',
        accept: undefined,
        fileUrl: null
      },
    ]
  },
  {
    id: 'group-audience-competitors',
    name: 'Audience and Competitors',
    questions: [
      { 
        id: 'question-b7', 
        text: 'Who is your primary target audience? (Age, gender, occupation, interests, tech-savviness, etc.)',
        type: 'textarea',
        accept: undefined,
        fileUrl: null
      },
      { 
        id: 'question-b8', 
        text: 'Who are your competitors, and how do you differ from them?',
        type: 'textarea',
        accept: undefined,
        fileUrl: null
      },
      {
        id: 'question-b9',
        text: 'Upload any reference materials or inspiration',
        type: 'file',
        accept: 'image/*,.pdf',
        fileUrl: null
      }
    ]
  }
];

// Remove or update websiteQuestions and appQuestions since we're focusing on branding

// Check what your defaultQuestions look like
console.log('Default Questions:', defaultQuestions);