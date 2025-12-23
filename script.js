// ===== ERROR HANDLING & LIBRARY CHECKS =====
window.addEventListener('error', (e) => {
  console.error('Error loading resource:', e.filename || e.target?.src, e.message);
});

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
  const theme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeIcon(theme);
});

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  if (icon) {
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

// ===== PARTICLES.JS CONFIGURATION =====
try {
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#d4af37' },
        shape: { type: 'circle' },
        opacity: {
          value: 0.5,
          random: true,
          anim: { enable: true, speed: 1, opacity_min: 0.1 }
        },
        size: {
          value: 3,
          random: true,
          anim: { enable: true, speed: 2, size_min: 0.1 }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#d4af37',
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: true,
          out_mode: 'out'
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        },
        modes: {
          grab: { distance: 140, line_linked: { opacity: 1 } },
          push: { particles_nb: 4 }
        }
      },
      retina_detect: true
    });
  } else {
    console.warn('Particles.js not loaded. Continuing without particle effects.');
  }
} catch (error) {
  console.error('Particles.js initialization failed:', error);
}

// ===== NAVIGATION =====
const navBar = document.querySelector('.nav-bar');
const navBurger = document.getElementById('navBurger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    navBar.classList.add('scrolled');
  } else {
    navBar.classList.remove('scrolled');
  }
  
  // Update active nav link
  updateActiveNavLink();
});

// Mobile menu toggle
if (navBurger && navMenu) {
  navBurger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

// Close mobile menu on link click
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (navMenu) {
      navMenu.classList.remove('active');
    }
  });
});

// Update active nav link based on scroll position
function updateActiveNavLink() {
  const sections = document.querySelectorAll('.section, .hero');
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// ===== TYPING EFFECT =====
const typingText = document.querySelector('.typing-text');
const phrases = [
  'Automotive Systems Engineer',
  'Seeking a Life Partner',
  'Entrepreneur & Innovator',
  'Family-Oriented Individual',
  'Adventure Enthusiast'
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

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

// Start typing effect
setTimeout(typeEffect, 1000);

// ===== PARALLAX EFFECT FOR HERO =====
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

// ===== TILT EFFECT =====
try {
  if (typeof VanillaTilt !== 'undefined') {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    if (tiltElements.length > 0) {
      VanillaTilt.init(tiltElements, {
        max: 15,
        speed: 400,
        glare: true,
        'max-glare': 0.3
      });
    }
  } else {
    console.warn('VanillaTilt not loaded. Continuing without tilt effects.');
  }
} catch (error) {
  console.error('VanillaTilt initialization failed:', error);
}

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('aos-animate');
      
      // Animate progress circles
      if (entry.target.classList.contains('value-item')) {
        animateProgressCircle(entry.target);
      }
    }
  });
}, observerOptions);

document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

// ===== PROGRESS CIRCLE ANIMATION =====
function animateProgressCircle(valueItem) {
  const circle = valueItem.querySelector('.circle-progress');
  if (circle && !circle.classList.contains('animated')) {
    const progress = circle.getAttribute('data-progress');
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (progress / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    circle.classList.add('animated');
  }
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - 70;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ===== COMPATIBILITY QUIZ =====
const quizData = [
  {
    question: "What's your age range?",
    options: ["25-28", "28-31", "31-34", "34+"],
    weights: [0.5, 1, 1, 0.7]
  },
  {
    question: "What's your educational background?",
    options: ["Undergraduate", "Master's", "PhD/Professional", "Other"],
    weights: [0.8, 1, 1, 0.6]
  },
  {
    question: "What's most important in a relationship?",
    options: ["Family values", "Career balance", "Personal growth", "Adventure & fun"],
    weights: [1, 0.9, 0.8, 0.7]
  },
  {
    question: "Your lifestyle preferences?",
    options: ["Vegetarian/Non-smoking", "Flexible diet", "Social drinker", "Party lifestyle"],
    weights: [1, 0.7, 0.5, 0.3]
  },
  {
    question: "How do you feel about living in the USA?",
    options: ["Love it, settled here", "Comfortable, occasional India visits", "Prefer India long-term", "Undecided"],
    weights: [1, 1, 0.6, 0.5]
  },
  {
    question: "Your career aspirations?",
    options: ["Established career", "Growing career", "Entrepreneurial", "Career break/transition"],
    weights: [1, 0.9, 1, 0.7]
  },
  {
    question: "Hobbies and interests?",
    options: ["Sports & outdoors", "Cooking & food", "Reading & learning", "Travel & culture"],
    weights: [1, 1, 0.9, 0.9]
  },
  {
    question: "Family dynamics preference?",
    options: ["Close-knit family", "Independent but connected", "Nuclear family focus", "Extended family"],
    weights: [1, 0.9, 0.8, 0.9]
  }
];

let currentQuestion = 0;
let answers = [];

const quizModal = document.getElementById('quizModal');
const startQuizBtn = document.getElementById('startQuiz');
const closeQuizBtn = document.getElementById('closeQuiz');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const quizQuestions = document.getElementById('quizQuestions');
const quizResult = document.getElementById('quizResult');

if (startQuizBtn) {
  startQuizBtn.addEventListener('click', () => {
    if (quizModal) {
      quizModal.classList.add('active');
      resetQuiz();
      showQuestion();
    }
  });
}

if (closeQuizBtn && quizModal) {
  closeQuizBtn.addEventListener('click', () => {
    quizModal.classList.remove('active');
  });
}

if (quizModal) {
  quizModal.addEventListener('click', (e) => {
    if (e.target === quizModal) {
      quizModal.classList.remove('active');
    }
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    if (currentQuestion > 0) {
      currentQuestion--;
      showQuestion();
    }
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    const selected = document.querySelector('.quiz-option.selected');
    if (selected) {
      answers[currentQuestion] = parseInt(selected.dataset.index);
      
      if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        showQuestion();
      } else {
        showResult();
      }
    } else {
      alert('Please select an option');
    }
  });
}

function resetQuiz() {
  currentQuestion = 0;
  answers = [];
  if (quizQuestions) quizQuestions.style.display = 'block';
  if (quizResult) quizResult.style.display = 'none';
  if (nextBtn) nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
}

function showQuestion() {
  const question = quizData[currentQuestion];
  
  if (quizQuestions) {
    quizQuestions.innerHTML = `
      <div class="quiz-question">
        <h3>Question ${currentQuestion + 1} of ${quizData.length}</h3>
        <p style="font-size: 1.2rem; margin: 1rem 0 2rem;">${question.question}</p>
        <div class="quiz-options">
          ${question.options.map((option, index) => `
            <div class="quiz-option ${answers[currentQuestion] === index ? 'selected' : ''}" data-index="${index}">
              ${option}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add click handlers to options
    document.querySelectorAll('.quiz-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
      });
    });
  }

  // Update navigation buttons
  if (prevBtn) prevBtn.style.display = currentQuestion === 0 ? 'none' : 'flex';
  if (nextBtn) {
    nextBtn.innerHTML = currentQuestion === quizData.length - 1 
      ? 'See Results <i class="fas fa-check"></i>' 
      : 'Next <i class="fas fa-arrow-right"></i>';
  }
}

function showResult() {
  let totalScore = 0;
  answers.forEach((answerIndex, questionIndex) => {
    totalScore += quizData[questionIndex].weights[answerIndex];
  });

  const maxScore = quizData.length;
  const percentage = Math.round((totalScore / maxScore) * 100);
  
  let resultMessage, resultEmoji, resultDescription;
  
  if (percentage >= 85) {
    resultEmoji = '🎉';
    resultMessage = 'Excellent Match!';
    resultDescription = 'Our values, lifestyle, and goals align wonderfully! I\'d love to connect and explore this potential further. Let\'s have a conversation!';
  } else if (percentage >= 70) {
    resultEmoji = '😊';
    resultMessage = 'Great Compatibility!';
    resultDescription = 'We share many important values and preferences. There\'s definitely potential here. Let\'s chat and see where it goes!';
  } else if (percentage >= 55) {
    resultEmoji = '🤔';
    resultMessage = 'Good Potential!';
    resultDescription = 'We have some good alignment with room to learn more about each other. Worth exploring further through conversation!';
  } else {
    resultEmoji = '💭';
    resultMessage = 'Different Paths';
    resultDescription = 'While we might have different preferences, compatibility is complex. If you feel there\'s a connection, I\'m open to conversation!';
  }

  if (quizQuestions) quizQuestions.style.display = 'none';
  if (quizResult) {
    quizResult.style.display = 'block';
    quizResult.innerHTML = `
      <div style="font-size: 5rem; margin-bottom: 1rem;">${resultEmoji}</div>
      <h3>${resultMessage}</h3>
      <div class="result-score">${percentage}%</div>
      <p style="font-size: 1.1rem; color: var(--text-light); margin: 2rem 0;">
        ${resultDescription}
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="#contact" class="quiz-btn quiz-btn-primary" onclick="document.getElementById('quizModal').classList.remove('active')">
          Get in Touch <i class="fas fa-envelope"></i>
        </a>
        <button class="quiz-btn" onclick="location.reload()">
          Retake Quiz <i class="fas fa-redo"></i>
        </button>
      </div>
    `;
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

    // Create mailto link
    const subject = encodeURIComponent(`Matrimonial Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`
    );
    
    window.location.href = `mailto:malavdalal@yahoo.com?subject=${subject}&body=${body}`;
    
    // Show success message
    alert('Thank you for reaching out! Your default email client will open to send the message.');
    contactForm.reset();
  });
}

// ===== PERFORMANCE: Lazy load images =====
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
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

// Add rainbow animation
const style = document.createElement('style');
style.textContent = `
  @keyframes rainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
`;
document.head.appendChild(style);

console.log('%c👋 Welcome to my profile!', 'font-size: 20px; color: #d4af37; font-weight: bold;');
console.log('%cLooking for your perfect match? Let\'s connect!', 'font-size: 14px; color: #666;');
