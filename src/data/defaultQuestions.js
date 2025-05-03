export const defaultQuestions = [
  {
    id: 'group-business',
    name: 'Business Info',
    questions: [
      { 
        id: 'question-b1', 
        text: 'What is the name of your business or project?',
        type: 'text'
      },
      { 
        id: 'question-b2', 
        text: 'Describe what your business/product/service does.',
        type: 'textarea'
      },
      { 
        id: 'question-b3', 
        text: 'What problem are you solving for your customers or users?',
        type: 'textarea'
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
        type: 'textarea'
      },
      { 
        id: 'question-b5', 
        text: 'What does success look like for this project?',
        type: 'textarea'
      },
      { 
        id: 'question-b6', 
        text: 'Do you have an established mission statement or core values?',
        type: 'textarea'
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
        type: 'textarea'
      },
      { 
        id: 'question-b8', 
        text: 'Who are your competitors, and how do you differ from them?',
        type: 'textarea'
      },
      {
        id: 'question-b9',
        text: 'Upload any reference materials or inspiration',
        type: 'file',
        accept: 'image/*,.pdf'
      }
    ]
  }
];

export const websiteQuestions = [
  {
    id: 'group-website-basics',
    name: 'Website Basics',
    questions: [
      { id: 'question-w1', text: 'What is the primary purpose of your website?' },
      { id: 'question-w2', text: 'Do you have an existing website? If yes, what are its current limitations?' },
      { id: 'question-w3', text: 'What are the main actions you want visitors to take on your website?' },
    ]
  },
  {
    id: 'group-website-content',
    name: 'Content and Features',
    questions: [
      { id: 'question-w4', text: 'What key features or functionality do you need? (e.g., contact forms, booking system, e-commerce)' },
      { id: 'question-w5', text: 'Do you have content ready (text, images, videos) or will you need help creating it?' },
      { id: 'question-w6', text: 'Will you need a blog or news section?' },
    ]
  },
  {
    id: 'group-website-design',
    name: 'Design Preferences',
    questions: [
      { id: 'question-w7', text: 'Are there any websites you like the design of? Please provide examples.' },
      { id: 'question-w8', text: 'Do you have brand guidelines (colors, fonts, logos) that need to be followed?' },
      { id: 'question-w9', text: 'How would you describe your desired website style? (e.g., minimal, bold, professional, playful)' },
    ]
  }
];

export const appQuestions = [
  {
    id: 'group-app-basics',
    name: 'App Basics',
    questions: [
      { id: 'question-a1', text: 'What platforms do you want to target? (iOS, Android, both)' },
      { id: 'question-a2', text: 'What is the core functionality of your app?' },
      { id: 'question-a3', text: 'What problem does your app solve for users?' },
    ]
  },
  {
    id: 'group-app-features',
    name: 'Features and Technology',
    questions: [
      { id: 'question-a4', text: 'What are the must-have features for your MVP (Minimum Viable Product)?' },
      { id: 'question-a5', text: 'Will users need to create accounts? What type of authentication?' },
      { id: 'question-a6', text: 'Do you need offline functionality?' },
      { id: 'question-a7', text: 'Will the app need to integrate with any external services or APIs?' },
    ]
  },
  {
    id: 'group-app-ux',
    name: 'User Experience',
    questions: [
      { id: 'question-a8', text: 'What apps do you like the user experience of? Please provide examples.' },
      { id: 'question-a9', text: 'How do you envision users navigating through your app?' },
      { id: 'question-a10', text: 'Are there any specific accessibility requirements?' },
    ]
  }
];

// Check what your defaultQuestions look like
console.log('Default Questions:', defaultQuestions);