(function () {
  'use strict';

  // ===== CONSTANTS =====
  const isDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const UNLIMITED_SELECTIONS = Infinity;
  const WEB3FORMS_ACCESS_KEY = 'e812d05b-2940-4006-b089-b14df29895e5';

  // ===== UTILITY FUNCTIONS =====
  function getTimestamp() {
    return new Date().toISOString();
  }

  function trackEvent(eventName, properties = {}) {
    if (typeof posthog !== 'undefined') {
      posthog.capture(eventName, { ...properties, timestamp: getTimestamp() });
    }
  }

  function debounce(fn, wait) { 
    let t; 
    return (...args) => { 
      clearTimeout(t); 
      t = setTimeout(() => fn.apply(this, args), wait); 
    }; 
  }

  // ===== ERROR HANDLING =====
  window.addEventListener('error', (e) => {
    if (isDev) console.error('Error loading resource:', e.filename || e.target?.src, e.message);
  }, { passive: true });

  // ===== THEME TOGGLE =====
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const currentTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const theme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateThemeIcon(theme);
      trackEvent('theme_toggled', { theme: theme });
    });
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle?.querySelector('i');
    if (icon) icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }

  // ===== PARTICLES.JS (disabled on small screens) =====
  try {
    if (window.matchMedia && !window.matchMedia('(max-width: 767px)').matches) {
      if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
          particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: '#d4af37' },
            shape: { type: 'circle' },
            opacity: { value: 0.45, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 140, color: '#d4af37', opacity: 0.35, width: 1 },
            move: { enable: true, speed: 2, random: true, out_mode: 'out' }
          },
          interactivity: { 
            detect_on: 'canvas', 
            events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true }, 
            modes: { grab: { distance: 140, line_linked: { opacity: 1 } }, push: { particles_nb: 4 } } 
          },
          retina_detect: true
        });
      } else if (isDev) {
        console.warn('Particles.js not loaded.');
      }
    }
  } catch (error) {
    if (isDev) console.error('Particles.js initialization failed:', error);
  }

  // ===== CACHED SELECTORS & STATE =====
  const navBar = document.querySelector('.nav-bar');
  const navBurger = document.getElementById('navBurger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = Array.from(document.querySelectorAll('.section, .hero'));
  const heroContent = document.querySelector('.hero-content');

  // ===== QUIZ CONFIGURATION =====
  const quizData = [
    { question: "What's your age range?", options: ["25-28", "28-31", "31-34", "34+"], weights: [0.5, 1, 1, 0.7], maxSelections: 1 },
    { question: "What's your educational background?", options: ["Undergraduate", "Master's", "PhD/Professional", "Other"], weights: [0.8, 1, 1, 0.6], maxSelections: 1 },
    { question: "What's most important in a relationship?", options: ["Family values", "Career balance", "Personal growth", "Adventure & fun"], weights: [1, 0.9, 0.8, 0.7], maxSelections: UNLIMITED_SELECTIONS },
    { question: "Your lifestyle preferences?", options: ["Vegetarian/Non-smoking", "Flexible diet", "Social drinker", "Party lifestyle"], weights: [1, 0.7, 0.5, 0.3], maxSelections: UNLIMITED_SELECTIONS },
    { question: "How do you feel about living in the USA?", options: ["Love it, settled here", "Comfortable, occasional India visits", "Prefer India long-term", "Undecided"], weights: [1, 1, 0.6, 0.5], maxSelections: 1 },
    { question: "Your career aspirations?", options: ["Established career", "Growing career", "Entrepreneurial", "Career break/transition"], weights: [1, 0.9, 1, 0.7], maxSelections: 2 },
    { question: "Hobbies and interests?", options: ["Sports & outdoors", "Cooking & food", "Reading & learning", "Travel & culture"], weights: [1, 1, 0.9, 0.9], maxSelections: UNLIMITED_SELECTIONS },
    { question: "Family dynamics preference?", options: ["Close-knit family", "Independent but connected", "Nuclear family focus", "Extended family"], weights: [1, 0.9, 0.8, 0.9], maxSelections: 1 }
  ];

  let currentQuestion = -1;
  let answers = [];
  let userName = '';
  let quizStartTime = null;

  const quizModal = document.getElementById('quizModal');
  const startQuizBtn = document.getElementById('startQuiz');
  const closeQuizBtn = document.getElementById('closeQuiz');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const quizQuestions = document.getElementById('quizQuestions');
  const quizResult = document.getElementById('quizResult');

  // ===== SCROLL HANDLING (rAF + passive) =====
  let lastScrollY = 0;
  let ticking = false;
  let sectionPositions = [];

  function computeSectionPositions() {
    sectionPositions = sections.map(s => ({ id: s.id, top: s.offsetTop }));
  }

  function handleScroll(scrollY) {
    if (navBar) {
      if (scrollY > 100) navBar.classList.add('scrolled'); 
      else navBar.classList.remove('scrolled');
    }

    if (heroContent) {
      heroContent.style.transform = `translateY(${scrollY * 0.5}px)`;
    }

    updateActiveNavLink(scrollY);
  }

  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll(lastScrollY);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', debounce(() => computeSectionPositions(), 150), { passive: true });

  computeSectionPositions();

  function updateActiveNavLink(scrollY = window.scrollY) {
    let current = '';
    for (const sec of sectionPositions) {
      if (scrollY >= sec.top - 200) current = sec.id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  // ===== MOBILE MENU & A11Y =====
  if (navBurger && navMenu) {
    navBurger.addEventListener('click', () => {
      const open = navMenu.classList.toggle('active');
      navBurger.setAttribute('aria-expanded', String(open));
      trackEvent('mobile_menu_toggled', { opened: open });
    });
  }

  navLinks.forEach(link => link.addEventListener('click', (e) => { 
    const section = e.target.getAttribute('href');
    trackEvent('navigation_clicked', { section: section });
    
    if (navMenu) { 
      navMenu.classList.remove('active'); 
      navBurger?.setAttribute('aria-expanded', 'false'); 
    } 
  }));

  // ===== TYPING EFFECT =====
  const typingText = document.querySelector('.typing-text');
  const phrases = ['Automotive Systems Engineer', 'Seeking a Life Partner', 'Entrepreneur & Innovator', 'Family-Oriented Individual', 'Adventure Enthusiast'];
  let phraseIndex = 0, charIndex = 0, isDeleting = false;

  function typeEffect() {
    if (!typingText) return;
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) { 
      typingText.textContent = currentPhrase.substring(0, charIndex - 1); 
      charIndex--; 
    } else { 
      typingText.textContent = currentPhrase.substring(0, charIndex + 1); 
      charIndex++; 
    }

    if (!isDeleting && charIndex === currentPhrase.length) { 
      isDeleting = true; 
      setTimeout(typeEffect, 2000); 
    } else if (isDeleting && charIndex === 0) { 
      isDeleting = false; 
      phraseIndex = (phraseIndex + 1) % phrases.length; 
      setTimeout(typeEffect, 500); 
    } else {
      setTimeout(typeEffect, isDeleting ? 50 : 100);
    }
  }
  setTimeout(typeEffect, 1000);

  // ===== VANILLA TILT =====
  try {
    if (typeof VanillaTilt !== 'undefined') {
      const tiltElements = document.querySelectorAll('[data-tilt]');
      if (tiltElements.length) VanillaTilt.init(tiltElements, { max: 15, speed: 400, glare: true, 'max-glare': 0.3 });
    } else if (isDev) {
      console.warn('VanillaTilt not loaded.');
    }
  } catch (err) { 
    if (isDev) console.error('VanillaTilt failed:', err); 
  }

  // ===== INTERSECTION OBSERVER FOR AOS =====
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        if (entry.target.classList.contains('value-item')) animateProgressCircle(entry.target);
      }
    });
  }, observerOptions);
  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

  function animateProgressCircle(valueItem) {
    const circle = valueItem.querySelector('.circle-progress');
    if (circle && !circle.classList.contains('animated')) {
      const progress = Number(circle.getAttribute('data-progress') || 0);
      const circumference = 2 * Math.PI * 45;
      const offset = circumference - (progress / 100) * circumference;
      circle.style.strokeDashoffset = offset;
      circle.classList.add('animated');
    }
  }

  // ===== SMOOTH SCROLL for anchors =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offsetTop = target.offsetTop - 70;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }, { passive: false });
  });

  // ===== QUIZ LOGIC =====
  function handleQuizClose() {
    const wasCompleted = quizResult && quizResult.style.display !== 'none';
    
    if (!wasCompleted && currentQuestion >= 0) {
      trackEvent('quiz_abandoned', {
        questions_answered: currentQuestion + 1,
        total_questions: quizData.length
      });
    }
    
    quizModal.classList.remove('active');
  }

  if (startQuizBtn) {
    startQuizBtn.addEventListener('click', () => { 
      quizModal?.classList.add('active'); 
      resetQuiz(); 
      showQuestion(); 
      
      quizStartTime = Date.now();
      trackEvent('quiz_started');
    });
  }

  if (closeQuizBtn && quizModal) {
    closeQuizBtn.addEventListener('click', handleQuizClose);
  }

  if (quizModal) {
    quizModal.addEventListener('click', (e) => { 
      if (e.target === quizModal) handleQuizClose();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => { 
      if (currentQuestion > -1) { 
        trackEvent('quiz_question_back', {
          from_question: currentQuestion + 1,
          to_question: currentQuestion
        });
        
        currentQuestion--; 
        showQuestion(); 
      } 
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentQuestion === -1) {
        const nameInput = document.getElementById('quizName');
        if (nameInput && nameInput.value.trim()) {
          userName = nameInput.value.trim();
          trackEvent('quiz_name_submitted', { name_length: userName.length });
          currentQuestion++;
          showQuestion();
        } else {
          alert('Please enter your name to continue');
        }
        return;
      }

      const hasSelection = answers[currentQuestion] && answers[currentQuestion].length > 0;
      
      if (hasSelection) {
        const question = quizData[currentQuestion];
        trackEvent('quiz_question_answered', {
          question_number: currentQuestion + 1,
          question_text: question.question,
          selections_count: answers[currentQuestion].length,
          max_allowed: question.maxSelections === UNLIMITED_SELECTIONS ? 'unlimited' : question.maxSelections
        });
        
        if (currentQuestion < quizData.length - 1) { 
          currentQuestion++; 
          showQuestion(); 
        } else {
          showResult();
        }
      } else {
        alert('Please select at least one option');
      }
    });
  }

  function resetQuiz() { 
    currentQuestion = -1; 
    answers = []; 
    userName = '';
    quizStartTime = null;
    if (quizQuestions) quizQuestions.style.display = 'block'; 
    if (quizResult) quizResult.style.display = 'none'; 
    if (nextBtn) nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>'; 
  }

  function showQuestion() {
    if (currentQuestion === -1) {
      if (quizQuestions) {
        quizQuestions.innerHTML = `
          <div class="quiz-question">
            <h3>Welcome to the Compatibility Quiz!</h3>
            <p style="font-size: 1.1rem; margin: 1.5rem 0; color: var(--text-light);">
              Before we begin, please tell us your name so we can personalize your experience.
            </p>
            <div class="form-group" style="margin: 2rem 0;">
              <input type="text" id="quizName" placeholder="Enter your full name" 
                     style="width: 100%; padding: 1rem; font-size: 1.1rem; border: 2px solid var(--gold); 
                            border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary);"
                     autofocus>
            </div>
          </div>
        `;
        
        const nameInput = document.getElementById('quizName');
        if (nameInput) {
          nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') nextBtn?.click();
          });
        }
      }
      
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.innerHTML = 'Start Quiz <i class="fas fa-arrow-right"></i>';
      return;
    }

    const question = quizData[currentQuestion];
    const maxSelections = question.maxSelections || 1;
    const isUnlimited = maxSelections === UNLIMITED_SELECTIONS;
    const isMultiple = maxSelections > 1;
    
    let instructionText = '';
    if (isUnlimited) {
      instructionText = '<p style="font-size: 0.9rem; color: var(--gold); margin-bottom: 1rem;">Select all that apply</p>';
    } else if (maxSelections > 1) {
      instructionText = `<p style="font-size: 0.9rem; color: var(--gold); margin-bottom: 1rem;">Select up to ${maxSelections} options</p>`;
    }
    
    if (quizQuestions) {
      quizQuestions.innerHTML = `
        <div class="quiz-question">
          <h3>Question ${currentQuestion + 1} of ${quizData.length}</h3>
          <p style="font-size: 1.2rem; margin: 1rem 0 2rem;">${question.question}</p>
          ${instructionText}
          <div class="quiz-options">
            ${question.options.map((option, index) => {
              const isSelected = answers[currentQuestion] && answers[currentQuestion].includes(index);
              return `
                <div class="quiz-option ${isSelected ? 'selected' : ''}" data-index="${index}">
                  ${option}
                  ${isMultiple ? '<span class="checkbox-indicator"></span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
      
      document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', () => {
          const index = parseInt(option.dataset.index, 10);
          
          if (!answers[currentQuestion]) {
            answers[currentQuestion] = [];
          }
          
          if (maxSelections === 1) {
            document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            answers[currentQuestion] = [index];
          } else {
            const currentSelections = answers[currentQuestion];
            const indexPos = currentSelections.indexOf(index);
            
            if (indexPos > -1) {
              currentSelections.splice(indexPos, 1);
              option.classList.remove('selected');
            } else if (isUnlimited || currentSelections.length < maxSelections) {
              currentSelections.push(index);
              option.classList.add('selected');
            } else {
              alert(`You can select up to ${maxSelections} options only`);
            }
          }
        });
      });
    }
    
    if (prevBtn) prevBtn.style.display = currentQuestion === 0 ? 'none' : 'flex';
    if (nextBtn) nextBtn.innerHTML = currentQuestion === quizData.length - 1 ? 'See Results <i class="fas fa-check"></i>' : 'Next <i class="fas fa-arrow-right"></i>';
  }

  async function submitQuizResults(userName, percentage, answers, resultMessage) {
    const formattedAnswers = answers.map((selectedIndices, questionIndex) => {
      const question = quizData[questionIndex];
      const selectedOptions = selectedIndices.map(idx => question.options[idx]).join(', ');
      return `Q${questionIndex + 1}: ${question.question}\nAnswer(s): ${selectedOptions}`;
    }).join('\n\n');
    
    const submissionData = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `Quiz Submission: ${userName} - ${resultMessage} (${percentage}%)`,
      from_name: "Matrimonial Quiz System",
      participant_name: userName,
      quiz_score: `${percentage}%`,
      result_message: resultMessage,
      timestamp: getTimestamp(),
      detailed_answers: formattedAnswers
    };

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();
      
      if (result.success) {
        if (isDev) console.log('Quiz results submitted successfully to Web3Forms');
        return true;
      } else {
        if (isDev) console.error('Web3Forms submission failed:', result);
        return false;
      }
    } catch (error) {
      if (isDev) console.error('Error submitting quiz results to Web3Forms:', error);
      return false;
    }
  }

  function attachResultEventListeners() {
    const ctaBtn = quizResult.querySelector('.cta-contact');
    const retakeBtn = quizResult.querySelector('.retake-quiz');

    if (ctaBtn) {
      ctaBtn.addEventListener('click', () => {
        quizModal.classList.remove('active');
        trackEvent('cta_clicked', { source: 'quiz_result', action: 'contact' });
      });
    }

    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        trackEvent('quiz_retake_clicked');
        resetQuiz();
        showQuestion();
      });
    }
  }

  function showResult() {
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    answers.forEach((selectedIndices, questionIndex) => {
      const question = quizData[questionIndex];
      
      if (selectedIndices && selectedIndices.length > 0) {
        const questionScore = selectedIndices.reduce((sum, idx) => {
          return sum + (question.weights[idx] || 0);
        }, 0) / selectedIndices.length;
        
        totalScore += questionScore;
      }
      
      maxPossibleScore += Math.max(...question.weights);
    });
    
    const percentage = Math.round((totalScore / (maxPossibleScore || 1)) * 100);
    const quizDuration = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : null;

    let resultMessage, resultEmoji, resultDescription;
    if (percentage >= 85) { 
      resultEmoji = '🎉'; 
      resultMessage = 'Excellent Match!'; 
      resultDescription = `${userName}, our values, lifestyle, and goals align wonderfully! I'd love to connect and explore this potential further. Let's have a conversation!`; 
    } else if (percentage >= 70) { 
      resultEmoji = '😊'; 
      resultMessage = 'Great Compatibility!'; 
      resultDescription = `${userName}, we share many important values and preferences. Let's chat and see where it goes!`; 
    } else if (percentage >= 55) { 
      resultEmoji = '🤔'; 
      resultMessage = 'Good Potential!'; 
      resultDescription = `${userName}, we have some good alignment with room to learn more about each other. Worth exploring further through conversation!`; 
    } else { 
      resultEmoji = '💭'; 
      resultMessage = 'Different Paths'; 
      resultDescription = `${userName}, while we might have different preferences, compatibility is complex. If you feel there's a connection, I'm open to conversation!`; 
    }

    submitQuizResults(userName, percentage, answers, resultMessage);

    if (typeof posthog !== 'undefined') {
      posthog.identify(userName, {
        name: userName,
        quiz_completed: true
      });
      
      trackEvent('quiz_completed', {
        participant_name: userName,
        score: percentage,
        result_category: resultMessage,
        duration_seconds: quizDuration,
        answers_summary: answers.map((selectedIndices, idx) => ({
          question_number: idx + 1,
          question: quizData[idx].question,
          selections_count: selectedIndices.length,
          selected_options: selectedIndices.map(i => quizData[idx].options[i])
        }))
      });
    }

    if (quizQuestions) quizQuestions.style.display = 'none';
    if (quizResult) {
      quizResult.style.display = 'block';
      quizResult.innerHTML = `
        <div style="font-size: 5rem; margin-bottom: 1rem;">${resultEmoji}</div>
        <h3>${resultMessage}</h3>
        <div class="result-score">${percentage}%</div>
        <p style="font-size: 1.1rem; color: var(--text-light); margin: 2rem 0;">${resultDescription}</p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="#contact" class="quiz-btn quiz-btn-primary cta-contact">
            Get in Touch <i class="fas fa-envelope"></i>
          </a>
          <button type="button" class="quiz-btn retake-quiz">
            Retake Quiz <i class="fas fa-redo"></i>
          </button>
        </div>
      `;
      
      attachResultEventListeners();
    }
  }

  // ===== CONTACT FORM =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const phone = document.getElementById('phone')?.value || '';
      const message = document.getElementById('message')?.value || '';
      
      trackEvent('contact_form_submitted', {
        has_phone: !!phone,
        message_length: message.length
      });
      
      const subject = encodeURIComponent(`Matrimonial Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`);
      window.location.href = `mailto:malavdalal@yahoo.com?subject=${subject}&body=${body}`;
      alert('Thank you for reaching out! Your default email client will open to send the message.');
      contactForm.reset();
    });
  }

  // ===== EASTER EGG: Konami Code =====
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;
  
  document.addEventListener('keydown', (e) => { 
    if (e.key === konamiCode[konamiIndex]) { 
      konamiIndex++; 
      if (konamiIndex === konamiCode.length) { 
        activateEasterEgg(); 
        konamiIndex = 0;
        trackEvent('easter_egg_discovered', { type: 'konami_code' });
      } 
    } else {
      konamiIndex = 0; 
    }
  });
  
  function activateEasterEgg() { 
    document.body.style.animation = 'rainbow 2s linear infinite'; 
    setTimeout(() => { 
      document.body.style.animation = ''; 
      alert('🎮 You found the secret! Thanks for being playful! 😄'); 
    }, 2000); 
  }

  const styleEl = document.createElement('style');
  styleEl.textContent = `@keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }`;
  document.head.appendChild(styleEl);

  // ===== PAGE VISIBILITY TRACKING =====
  if (typeof posthog !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        trackEvent('page_hidden');
      } else {
        trackEvent('page_visible');
      }
    });
    
    window.addEventListener('beforeunload', () => {
      trackEvent('page_exit');
    });
  }

  // ===== DEVELOPMENT CONSOLE MESSAGES =====
  if (isDev) {
    console.log('%c👋 Welcome to my profile!', 'font-size: 20px; color: #d4af37; font-weight: bold;');
    console.log('%cLooking for your perfect match? Let\'s connect!', 'font-size: 14px; color: #666;');
    console.log('%c📊 PostHog analytics enabled', 'font-size: 12px; color: #1d4ed8;');
  }

})();
