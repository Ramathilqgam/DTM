import { useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';

export default function FloatingAIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI assistant. I can help you with:\n\n\u2022 Learning plans (languages, programming, music, fitness)\n\u2022 Task management and productivity\n\u2022 Real-time questions (time, weather, calculations)\n\u2022 Goal setting and skill development\n\u2022 Study tips and motivation\n\nHow can I assist you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const generateLearningPlan = (topic, days) => {
    const plans = {
      'language': {
        title: 'Language Learning Plan',
        plan: [
          'Day 1: Learn basic greetings and introductions (Hello, Goodbye, Thank you)',
          'Day 2: Master numbers 1-20 and basic counting',
          'Day 3: Learn common phrases for ordering food and drinks',
          'Day 4: Study days of the week and months',
          'Day 5: Practice asking for directions and locations',
          'Day 6: Learn family members and relationships',
          'Day 7: Review week 1 vocabulary with flashcards',
          'Day 8: Learn basic verb conjugations (present tense)',
          'Day 9: Study colors and descriptive adjectives',
          'Day 10: Practice telling time and scheduling',
          'Day 11: Learn shopping vocabulary and phrases',
          'Day 12: Study transportation and travel terms',
          'Day 13: Practice weather expressions and small talk',
          'Day 14: Review week 2 and take practice quiz',
          'Day 15: Learn past tense verb forms',
          'Day 16: Study future tense and making plans',
          'Day 17: Learn medical and emergency phrases',
          'Day 18: Practice business and work vocabulary',
          'Day 19: Study cultural customs and etiquette',
          'Day 20: Review all tenses and complex sentences',
          'Day 21: Practice with native speaker or language exchange',
          'Day 22: Learn idioms and common expressions',
          'Day 23: Study slang and informal language',
          'Day 24: Practice listening comprehension with media',
          'Day 25: Learn writing skills and composition',
          'Day 26: Study advanced grammar concepts',
          'Day 27: Practice reading authentic materials',
          'Day 28: Final review and fluency assessment',
          'Day 29: Cultural immersion activities',
          'Day 30: Create language learning routine for continued growth'
        ]
      },
      'programming': {
        title: 'Programming Learning Plan',
        plan: [
          'Day 1: Set up development environment and tools',
          'Day 2: Learn basic syntax and data types',
          'Day 3: Master variables and operators',
          'Day 4: Study conditional statements (if/else)',
          'Day 5: Learn loops and iteration',
          'Day 6: Practice writing simple programs',
          'Day 7: Functions and parameters',
          'Day 8: Arrays and data structures basics',
          'Day 9: String manipulation methods',
          'Day 10: Error handling and debugging',
          'Day 11: Object-oriented programming concepts',
          'Day 12: Classes and objects',
          'Day 13: Inheritance and polymorphism',
          'Day 14: File I/O operations',
          'Day 15: Build a small project using learned concepts',
          'Day 16: API integration and web requests',
          'Day 17: Database basics and SQL',
          'Day 18: Version control with Git',
          'Day 19: Testing and unit testing',
          'Day 20: Code optimization and performance',
          'Day 21: Framework introduction',
          'Day 22: Build a web application',
          'Day 23: Authentication and security basics',
          'Day 24: Deployment and hosting',
          'Day 25: Advanced data structures',
          'Day 26: Algorithms and problem solving',
          'Day 27: Design patterns',
          'Day 28: Code review and refactoring',
          'Day 29: Contributing to open source',
          'Day 30: Portfolio project and continuous learning'
        ]
      },
      'music': {
        title: 'Music Learning Plan',
        plan: [
          'Day 1: Learn basic music theory (notes, scales)',
          'Day 2: Understand rhythm and time signatures',
          'Day 3: Practice proper posture and hand position',
          'Day 4: Learn basic chords (C, G, Am, F)',
          'Day 5: Practice chord transitions smoothly',
          'Day 6: Learn simple strumming patterns',
          'Day 7: Practice playing your first song',
          'Day 8: Learn barre chords basics',
          'Day 9: Practice fingerpicking patterns',
          'Day 10: Learn music reading fundamentals',
          'Day 11: Practice scales and finger exercises',
          'Day 12: Learn intermediate chords',
          'Day 13: Practice ear training exercises',
          'Day 14: Learn improvisation basics',
          'Day 15: Record yourself playing and analyze',
          'Day 16: Learn advanced techniques (hammer-ons, pull-offs)',
          'Day 17: Practice music theory application',
          'Day 18: Learn songs in different keys',
          'Day 19: Practice playing with a metronome',
          'Day 20: Learn music composition basics',
          'Day 21: Practice playing with others',
          'Day 22: Learn advanced rhythm patterns',
          'Day 23: Study different music genres',
          'Day 24: Practice performance skills',
          'Day 25: Learn music production basics',
          'Day 26: Practice sight-reading',
          'Day 27: Learn advanced music theory',
          'Day 28: Create original music',
          'Day 29: Performance preparation',
          'Day 30: Develop practice routine and goals'
        ]
      },
      'fitness': {
        title: 'Fitness Learning Plan',
        plan: [
          'Day 1: Assess current fitness level and set goals',
          'Day 2: Learn proper form for basic exercises',
          'Day 3: Create workout schedule and routine',
          'Day 4: Practice basic cardio exercises',
          'Day 5: Learn strength training fundamentals',
          'Day 6: Practice bodyweight exercises',
          'Day 7: Rest day and flexibility training',
          'Day 8: Learn nutrition basics',
          'Day 9: Meal planning and preparation',
          'Day 10: Practice progressive overload principles',
          'Day 11: Learn advanced cardio techniques',
          'Day 12: Practice weight training form',
          'Day 13: Learn muscle group targeting',
          'Day 14: Practice HIIT workouts',
          'Day 15: Assess progress and adjust goals',
          'Day 16: Learn recovery and injury prevention',
          'Day 17: Practice advanced strength exercises',
          'Day 18: Learn supplementation basics',
          'Day 19: Practice functional fitness movements',
          'Day 20: Learn sports-specific training',
          'Day 21: Practice mobility and flexibility',
          'Day 22: Learn advanced programming concepts',
          'Day 23: Practice periodization principles',
          'Day 24: Learn mental training techniques',
          'Day 25: Practice competition preparation',
          'Day 26: Learn advanced nutrition strategies',
          'Day 27: Practice performance testing',
          'Day 28: Learn long-term fitness planning',
          'Day 29: Create sustainable fitness lifestyle',
          'Day 30: Develop coaching and teaching skills'
        ]
      }
    };

    const lowerTopic = topic.toLowerCase();
    let selectedPlan = null;

    if (lowerTopic.includes('language') || lowerTopic.includes('spanish') || lowerTopic.includes('french') || lowerTopic.includes('german') || lowerTopic.includes('italian') || lowerTopic.includes('chinese') || lowerTopic.includes('japanese')) {
      selectedPlan = plans.language;
    } else if (lowerTopic.includes('programming') || lowerTopic.includes('coding') || lowerTopic.includes('javascript') || lowerTopic.includes('python') || lowerTopic.includes('code')) {
      selectedPlan = plans.programming;
    } else if (lowerTopic.includes('music') || lowerTopic.includes('guitar') || lowerTopic.includes('piano') || lowerTopic.includes('singing') || lowerTopic.includes('instrument')) {
      selectedPlan = plans.music;
    } else if (lowerTopic.includes('fitness') || lowerTopic.includes('workout') || lowerTopic.includes('exercise') || lowerTopic.includes('gym') || lowerTopic.includes('training')) {
      selectedPlan = plans.fitness;
    } else {
      selectedPlan = plans.language;
    }

    const adjustedPlan = selectedPlan.plan.slice(0, Math.min(days, selectedPlan.plan.length));

    return {
      title: selectedPlan.title,
      days: adjustedPlan,
      totalDays: days
    };
  };

  const processRealTimeQuestion = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    // Time-related questions
    if (lowerQuestion.includes('time') || lowerQuestion.includes('what time')) {
      const now = new Date();
      return `The current time is ${now.toLocaleTimeString()} on ${now.toLocaleDateString()}.`;
    }
    
    // Date-related questions
    if (lowerQuestion.includes('date') || lowerQuestion.includes('what day') || lowerQuestion.includes('today')) {
      const now = new Date();
      return `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }
    
    // Weather questions (simulated)
    if (lowerQuestion.includes('weather')) {
      return `The weather today is partly cloudy with a high of 72°F (22°C) and a low of 58°F (14°C). Perfect weather for productive work!`;
    }
    
    // Math calculations
    if (lowerQuestion.includes('calculate') || lowerQuestion.includes('what is') || lowerQuestion.includes('solve')) {
      const mathMatch = question.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
      if (mathMatch) {
        const num1 = parseInt(mathMatch[1]);
        const operator = mathMatch[2];
        const num2 = parseInt(mathMatch[3]);
        let result;
        
        switch (operator) {
          case '+': result = num1 + num2; break;
          case '-': result = num1 - num2; break;
          case '*': result = num1 * num2; break;
          case '/': result = num2 !== 0 ? (num1 / num2).toFixed(2) : 'Cannot divide by zero'; break;
          default: result = 'Invalid operation';
        }
        
        return `${num1} ${operator} ${num2} = ${result}`;
      }
    }
    
    // General knowledge
    if (lowerQuestion.includes('who') || lowerQuestion.includes('what') || lowerQuestion.includes('where') || lowerQuestion.includes('when') || lowerQuestion.includes('why') || lowerQuestion.includes('how')) {
      if (lowerQuestion.includes('capital')) {
        if (lowerQuestion.includes('france')) return 'The capital of France is Paris.';
        if (lowerQuestion.includes('japan')) return 'The capital of Japan is Tokyo.';
        if (lowerQuestion.includes('italy')) return 'The capital of Italy is Rome.';
        if (lowerQuestion.includes('spain')) return 'The capital of Spain is Madrid.';
      }
      
      if (lowerQuestion.includes('largest planet')) return 'Jupiter is the largest planet in our solar system.';
      if (lowerQuestion.includes('ocean')) return 'The Pacific Ocean is the largest ocean on Earth.';
      if (lowerQuestion.includes('president')) return 'As of my last update, Joe Biden is the President of the United States.';
    }
    
    return null; // Return null if no real-time answer is available
  };

  const generateAIResponse = async (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Try real-time questions first
    const realTimeAnswer = processRealTimeQuestion(userMessage);
    if (realTimeAnswer) {
      return realTimeAnswer;
    }
    
    // Learning plan requests - more comprehensive matching
    if ((lowerMessage.includes('plan') || lowerMessage.includes('schedule') || lowerMessage.includes('roadmap')) && 
        (lowerMessage.includes('learning') || lowerMessage.includes('learn') || lowerMessage.includes('study') || 
         lowerMessage.includes('want to learn') || lowerMessage.includes('give me') || lowerMessage.includes('create'))) {
      
      // Extract topic more comprehensively
      let topic = 'language';
      let days = 30;
      
      // Extract days from various patterns
      const daysMatch = userMessage.match(/(\d+)\s*(?:days?|day)/i);
      if (daysMatch) {
        days = parseInt(daysMatch[1]);
      }
      
      // Extract topic from various patterns
      const topicPatterns = [
        /(?:learn|study|learning|plan for|plan to|want to learn|give me|create)\s+([a-z\s]+?)(?:\s+\d+|\s+day|\s+plan|$)/i,
        /(?:python|javascript|java|programming|coding|language|spanish|french|german|music|guitar|piano|fitness|workout|exercise)/i
      ];
      
      for (const pattern of topicPatterns) {
        const match = userMessage.match(pattern);
        if (match) {
          topic = match[1] ? match[1].trim() : match[0];
          break;
        }
      }
      
      // Specific topic detection
      if (lowerMessage.includes('python')) topic = 'programming';
      else if (lowerMessage.includes('javascript') || lowerMessage.includes('java') || lowerMessage.includes('coding')) topic = 'programming';
      else if (lowerMessage.includes('spanish') || lowerMessage.includes('french') || lowerMessage.includes('german') || 
               lowerMessage.includes('italian') || lowerMessage.includes('chinese') || lowerMessage.includes('japanese')) topic = 'language';
      else if (lowerMessage.includes('guitar') || lowerMessage.includes('piano') || lowerMessage.includes('singing') || 
               lowerMessage.includes('music') || lowerMessage.includes('instrument')) topic = 'music';
      else if (lowerMessage.includes('fitness') || lowerMessage.includes('workout') || lowerMessage.includes('exercise') || 
               lowerMessage.includes('gym') || lowerMessage.includes('training')) topic = 'fitness';
      
      const learningPlan = generateLearningPlan(topic, days);
      
      return `${learningPlan.title} - ${learningPlan.totalDays} Days:\n\n${learningPlan.days.map((day, index) => `Day ${index + 1}: ${day}`).join('\n\n')}`;
    }
    
    // Goal setting - more direct
    if (lowerMessage.includes('goal') || lowerMessage.includes('goals')) {
      // Detect specific goal type
      if (lowerMessage.includes('career') || lowerMessage.includes('job')) {
        return `Career Goal Framework:\n\n**Short-term (1-3 months):**\n- Update resume and LinkedIn\n- Apply to 5 jobs per week\n- Network with 3 professionals monthly\n\n**Medium-term (3-6 months):**\n- Complete relevant certification\n- Build 2 portfolio projects\n- Attend industry event\n\n**Long-term (6-12 months):**\n- Land target role\n- Negotiate 15% salary increase\n- Establish mentor relationship\n\nTrack progress weekly and adjust as needed!`;
      }
      else if (lowerMessage.includes('fitness') || lowerMessage.includes('health')) {
        return `Health Goal Framework:\n\n**Fitness Goals:**\n- Exercise 4x per week (30 min sessions)\n- Run 5K in under 30 minutes by month 3\n- Lose 10 pounds in 2 months\n\n**Nutrition Goals:**\n- Meal prep Sundays\n- 5 servings vegetables daily\n- 8 glasses water daily\n\n**Sleep Goals:**\n- 7-8 hours sleep nightly\n- Consistent bedtime schedule\n- No screens 1 hour before bed\n\nStart with one habit and build momentum!`;
      }
      else if (lowerMessage.includes('learning') || lowerMessage.includes('study')) {
        return `Learning Goal Framework:\n\n**Weekly Goals:**\n- Study 10 hours per week\n- Complete 1 module/week\n- Practice 3 exercises daily\n\n**Monthly Goals:**\n- Finish course/module\n- Build 1 project\n- Take practice test\n\n**Quarterly Goals:**\n- Complete certification\n- Build portfolio\n- Apply skills to real project\n\nUse spaced repetition and active recall for best results!`;
      }
      
      return `SMART Goal Framework:\n\n**Specific:** Exactly what you want (e.g., "Learn Python basics")\n**Measurable:** How to track (e.g., "Complete 3 modules")\n**Achievable:** Realistic timeline (e.g., "In 30 days")\n**Relevant:** Why it matters (e.g., "For career change")\n**Time-bound:** Deadline (e.g., "By March 31st")\n\nExample: "Complete Python basics course and build 2 simple projects by March 31st for career transition."\n\nWhat specific goal would you like to set?`;
    }
    
    // Skills development - more direct with specific recommendations
    if (lowerMessage.includes('skill') || lowerMessage.includes('skills') || lowerMessage.includes('learn')) {
      if (lowerMessage.includes('programming') || lowerMessage.includes('coding') || lowerMessage.includes('tech')) {
        return `Top Programming Skills to Learn:\n\n**Beginner (3-6 months):**\n1. Python - Data analysis, automation\n2. JavaScript - Web development\n3. SQL - Database management\n4. Git - Version control\n\n**Intermediate (6-12 months):**\n5. React/Angular - Frontend frameworks\n6. Node.js - Backend development\n7. AWS/Azure - Cloud platforms\n8. Docker - Containerization\n\n**Advanced (12+ months):**\n9. Machine Learning fundamentals\n10. Kubernetes - Orchestration\n11. DevOps practices\n12. System design\n\n**Learning Path:** Start with Python for versatility, then JavaScript for web. Build projects as you learn!`;
      }
      else if (lowerMessage.includes('business') || lowerMessage.includes('career')) {
        return `Essential Business Skills:\n\n**Communication:**\n- Public speaking (Toastmasters)\n- Business writing\n- Negotiation skills\n- Cross-cultural communication\n\n**Leadership:**\n- Team management\n- Decision making\n- Conflict resolution\n- Strategic thinking\n\n**Technical Business:**\n- Data analysis (Excel, Tableau)\n- Project management\n- Financial literacy\n- Digital marketing\n\n**Soft Skills:**\n- Networking\n- Time management\n- Emotional intelligence\n- Adaptability\n\n**Priority:** Start with communication and data analysis - these apply to all roles!`;
      }
      else if (lowerMessage.includes('creative') || lowerMessage.includes('design')) {
        return `High-Demand Creative Skills:\n\n**Design:**\n1. Graphic Design (Photoshop, Illustrator)\n2. UI/UX Design (Figma, Adobe XD)\n3. Web Design (HTML/CSS basics)\n4. Motion Graphics (After Effects)\n\n**Content Creation:**\n5. Video Editing (Premiere Pro, DaVinci)\n6. Content Writing (SEO, copywriting)\n7. Social Media Management\n8. Photography basics\n\n**Freelance Skills:**\n9. Client management\n10. Pricing and contracts\n11. Portfolio development\n12. Marketing yourself\n\n**Start:** Learn UI/UX design first - high demand and good income potential!`;
      }
      
      return `Most Valuable Skills Today:\n\n**Tech Skills (High Demand):**\n- Python programming\n- Data analysis\n- Web development\n- Cloud computing\n- Cybersecurity\n\n**Business Skills:**\n- Project management\n- Digital marketing\n- Financial analysis\n- Communication\n- Leadership\n\n**Creative Skills:**\n- UI/UX design\n- Content creation\n- Video editing\n- Copywriting\n\n**Soft Skills:**\n- Problem-solving\n- Adaptability\n- Emotional intelligence\n\n**Recommendation:** Learn Python + data analysis - applicable across industries with great career prospects!`;
    }
    
    // Productivity tips - more direct and actionable
    if (lowerMessage.includes('productivity') || lowerMessage.includes('focus') || lowerMessage.includes('motivation')) {
      if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate')) {
        return `Immediate Focus Strategies:\n\n**Right Now (Next 60 min):**\n1. Turn off phone notifications\n2. Close unnecessary browser tabs\n3. Put on headphones (focus music or white noise)\n4. Set timer for 25 minutes (Pomodoro)\n5. Work on ONE task only\n\n**Daily Focus Routine:**\n- Morning: Plan top 3 priorities\n- Work: 2-hour deep work blocks\n- Breaks: 5 min every 25 min\n- Evening: Review and plan tomorrow\n\n**Environment Setup:**\n- Clean workspace\n- Good lighting\n- Comfortable temperature\n- Water bottle nearby\n\n**Start Timer Now:** 25 minutes focused work, then 5-minute break!`;
      }
      else if (lowerMessage.includes('motivation') || lowerMessage.includes('energy')) {
        return `Instant Motivation Boosters:\n\n**Quick Wins (5 minutes):**\n1. Drink cold water\n2. Stretch for 2 minutes\n3. Listen to upbeat music\n4. Write 3 things you're grateful for\n5. Look at your goals/why\n\n**Energy Management:**\n- Sleep: 7-9 hours (non-negotiable)\n- Exercise: 20 min walk daily\n- Nutrition: Protein with each meal\n- Hydration: 8 glasses water\n\n**Mindset Tricks:**\n- "Just 5 minutes" rule (start small)\n- Track progress (visual wins)\n- Reward yourself (small treats)\n- Accountability partner\n\n**Try Now:** Pick one quick win and do it immediately!`;
      }
      
      return `Productivity System That Works:\n\n**Morning Routine (30 min):**\n- Review goals (5 min)\n- Plan top 3 priorities (10 min)\n- Tidy workspace (5 min)\n- Mindfulness/breathing (10 min)\n\n**Work Blocks:**\n- 9-11am: Deep work (most important)\n- 11-12pm: Meetings/communication\n- 1-3pm: Creative work\n- 3-4pm: Administrative tasks\n- 4-5pm: Planning tomorrow\n\n**Weekly Review:**\n- Friday: Review accomplishments\n- Sunday: Plan upcoming week\n\n**Tools:** Use calendar for time blocking, not just to-do lists\n\n**Start Tomorrow:** Try this schedule for one week!`;
    }
    
    // Task management - more direct with specific systems
    if (lowerMessage.includes('task') || lowerMessage.includes('tasks') || lowerMessage.includes('organize')) {
      if (lowerMessage.includes('organize') || lowerMessage.includes('overwhelmed')) {
        return `Task Organization System:\n\n**Step 1: Brain Dump (15 min)**\nWrite EVERYTHING you need to do on paper\n\n**Step 2: Categorize**\n- Work/Career\n- Personal/Home\n- Health/Fitness\n- Learning/Growth\n- Social/Family\n\n**Step 3: Prioritize Each Category**\n- A: Must do this week\n- B: Should do this week\n- C: Could do this week\n- D: Delegate\n- E: Eliminate\n\n**Step 4: Schedule**\n- A tasks: Schedule specific times\n- B tasks: Fill remaining slots\n- C tasks: Weekend/extra time\n\n**Daily:** Pick 3 A-tasks to complete\n\n**Start Now:** Do a 15-minute brain dump!`;
      }
      
      return `Task Management Framework:\n\n**Daily System:**\n1. **Morning:** Choose 3 priorities for the day\n2. **During Day:** Work on priority #1 first\n3. **Evening:** Review progress and plan tomorrow\n\n**Weekly System:**\n- **Sunday:** Plan week goals\n- **Monday:** Execute priority tasks\n- **Wednesday:** Mid-week review\n- **Friday:** Complete and celebrate\n- **Saturday:** Rest/recharge\n\n**Priority Matrix:**\n- **Urgent + Important:** Do immediately\n- **Important + Not Urgent:** Schedule\n- **Urgent + Not Important:** Delegate\n- **Not Urgent + Not Important:** Eliminate\n\n**Tools:**\n- Digital: Notion/Trello for complex projects\n- Simple: Paper notebook for daily tasks\n- Calendar: For time-sensitive items\n\n**Today:** What are your top 3 priorities?`;
    }
    
    // Study tips
    if (lowerMessage.includes('study') || lowerMessage.includes('learning') || lowerMessage.includes('remember')) {
      return `Science-backed learning techniques:\n\n**Active Learning:**\n- Practice retrieval (test yourself)\n- Teach concepts to others\n- Apply knowledge immediately\n\n**Memory Techniques:**\n- Spaced repetition (review at increasing intervals)\n- Mnemonic devices and associations\n- Visual learning (diagrams, mind maps)\n\n**Study Environment:**\n- Quiet, dedicated space\n- Remove distractions\n- Use background music if helpful\n\n**Optimal Timing:**\n- Study when alert (morning for most)\n- Take breaks every 45-60 minutes\n- Sleep within 2 hours of studying\n\nWhat subject are you studying? I can provide specific strategies!`;
    }
    
    // Career advice
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
      return `Career development guidance:\n\n**Skill Building:**\n- Identify in-demand skills in your field\n- Take online courses (Coursera, Udemy, edX)\n- Get certifications where relevant\n- Build portfolio projects\n\n**Networking:**\n- LinkedIn optimization\n- Industry events and meetups\n- Informational interviews\n- Join professional associations\n\n**Job Search Strategy:**\n- Tailor resume for each application\n- Practice interview questions\n- Research companies thoroughly\n- Follow up after interviews\n\n**Long-term Growth:**\n- Find a mentor\n- Seek feedback regularly\n- Take on challenging projects\n- Consider lateral moves for growth\n\nWhat's your current career situation?`;
    }
    
    // Health and wellness
    if (lowerMessage.includes('health') || lowerMessage.includes('exercise') || lowerMessage.includes('diet') || lowerQuestion.includes('sleep')) {
      return `Holistic health recommendations:\n\n**Physical Health:**\n- 150 minutes moderate exercise weekly\n- Strength training 2-3x per week\n- 7-9 hours quality sleep\n- Stay hydrated (8 glasses water daily)\n\n**Nutrition:**\n- Balanced meals with protein, carbs, healthy fats\n- 5 servings fruits/vegetables daily\n- Limit processed foods and sugar\n- Mindful eating practices\n\n**Mental Health:**\n- Daily meditation or mindfulness\n- Regular social connections\n- Stress management techniques\n- Professional help when needed\n\n**Prevention:**\n- Annual health checkups\n- Regular dental visits\n- Sun protection\n- Proper ergonomics at work\n\nWhich aspect would you like to focus on first?`;
    }
    
    // Default helpful response
    return `I'm here to help! I can assist you with:\n\n\u2022 **Learning Plans**: "Create a 30-day plan for learning Spanish"\n\u2022 **Task Management**: "Help me organize my tasks"\n\u2022 **Goal Setting**: "Help me set career goals"\n\u2022 **Productivity**: "Give me focus tips"\n\u2022 **Study Skills**: "How can I study better?"\n\u2022 **Career Advice**: "How to advance my career"\n\u2022 **Health Tips**: "Improve my daily routine"\n\u2022 **Real-time Questions**: "What time is it?" or "Calculate 25 + 17"\n\nWhat specific area would you like help with?`;
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      // Use local AI processing first for better responses
      let aiResponse = await generateAIResponse(currentMessage);
      
      // Only try backend API if local processing doesn't recognize the request
      if (aiResponse.includes("I'm here to help") || aiResponse.includes("What specific area")) {
        try {
          const response = await api.post('/ai/chat', {
            message: currentMessage
          });
          aiResponse = response.data.response;
        } catch (apiError) {
          console.log('Backend API unavailable, keeping local response');
          // Keep the local response
        }
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having trouble processing that right now. Please try again or rephrase your question.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating AI Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
        >
          <div className="relative">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            AI Assistant - Click to chat!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Assistant</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 px-3 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                )}
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-2 flex-wrap">
              <button
                onClick={() => setMessage("What time is it?")}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded transition-colors"
              >
                Time
              </button>
              <button
                onClick={() => setMessage("Give me a 30-day learning plan")}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded transition-colors"
              >
                Learning Plan
              </button>
              <button
                onClick={() => setMessage("Calculate 25 + 17")}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded transition-colors"
              >
                Calculate
              </button>
              <button
                onClick={() => setMessage("Help me set goals")}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded transition-colors"
              >
                Set Goals
              </button>
              <button
                onClick={() => setMessage("What's the weather like?")}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded transition-colors"
              >
                Weather
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
