document.addEventListener('DOMContentLoaded', () => {
  /* Animation */
  const obs = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target
      .dataset
      .animate
      .split(' ')
      .forEach(cls => entry.target.classList.add(cls));
    observer.unobserve(entry.target);
  });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px'
  });

  document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));

  /* Responsive hamburger menu button */ 
  const navigation = document.getElementById('navigation');
  const menuButton = document.getElementById('hamburger-btn');
  const links = document.querySelectorAll('a[href^="#"]');

  const toggleNavigation = () => {
    const open = !navigation.classList.contains('active');
    navigation.classList.toggle('active');
    menuButton.classList.toggle('active');
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = navigation.classList.contains('active') ? 'hidden' : ''; //Ternary Enable/Renable
  }

  menuButton.addEventListener('click', toggleNavigation);

  document.addEventListener('click', e => {
    if (navigation.classList.contains('active') && !navigation.contains(e.target) && !menuButton.contains(e.target))
      toggleNavigation();
  });
  
  /* Smooth click scroll animation */
  const smoothScroll = (targetSelector, duration) => {
    const targetEl = document.querySelector(targetSelector);
    const startY = window.pageYOffset;
    const targetRect = targetEl.getBoundingClientRect();

    const offset = (window.innerHeight - targetRect.height) / 2;
    const targetY = targetRect.top + startY - offset;
    const distance = targetY - startY;
    let startTime = null;

    const ease = (t, b, c, d) =>{
      t /= d/2;
      if (t < 1) return c/2*t*t + b;
      t--;
      return -c/2 * (t*(t-2) -1) + b;
    }

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const runY = ease(timeElapsed, startY, distance, duration);
      window.scrollTo(0, runY);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const wasOpen = navigation.classList.contains('active');
      if (wasOpen) toggleNavigation();

      const delay = wasOpen ? 300 : 0;
      setTimeout(() => smoothScroll(href, 800), delay);
    });
  });

    const video = document.getElementById('intro-video');

    const src = window.innerWidth < 768 ? 'resources/media/Introwithsound-mobile.mp4' : 'resources/media/Introwithsound-desktop.mp4';

    video.innerHTML = `<source src="${src}" type="video/mp4">`;

    video.load();
    video.play().catch(err => console.warn('Autoplay probably blocked, but video is loaded.', err));

    video.addEventListener('play', () => {
      video.classList.add('played'); // add class for positioning video object with media queries
    });

    /* Carousel */ 
    const carousel = document.querySelector('.carousel');
    const items = document.querySelectorAll('.carousel-item');
    const prevButton = document.getElementById('left');
    const nextButton = document.getElementById('right');

    let currentIndex = 0;

    const updateCarousel = () => {
        const itemWidth = items[0].offsetWidth;
        const containerWidth = carousel.offsetWidth;

        // Center the current item by offsetting it
        const offset = Math.round(-((itemWidth * currentIndex) - (containerWidth / 2) + (itemWidth / 2)));
        carousel.style.transform = `translateX(${offset}px)`;

        items.forEach(item => item.classList.remove('active'));

        if (items[currentIndex]) {
            items[currentIndex].classList.add('active');
        }
    }

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < items.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Recalculate on resize
    window.addEventListener('resize', updateCarousel);

    // Initialize
    updateCarousel();

    /* Booking modal */
    const appointment =  document.getElementById('glassy-button').addEventListener('click', () => {
        const book = document.getElementById('booking-appointment');
        book.classList.toggle('active');
            if (book.classList.contains('active')) {
            document.body.style.overflow = 'hidden'; // Disable scrolling
            } else {
                document.body.style.overflow = ''; // Re-enable scrolling
            }

    });

    const Xbtn = document.getElementById('x-btn').addEventListener('click', () => {
        const book = document.getElementById('booking-appointment');
        book.classList.remove('active');
            if (book.classList.contains('active')) {
            document.body.style.overflow = 'hidden'; // Disable scrolling
            } else {
                document.body.style.overflow = ''; // Re-enable scrolling
            }
    });

    
    // ------- helper functions --------
    const newest = (a, b) => {
      const ta = Number((a.filename || '').split('-')[1]);
      const tb = Number((b.filename || '').split('-')[1]);
      return (tb || 0) - (ta || 0);
    }   
    const img = (item, altFallback) => {
      const alt = item.title || altFallback || 'Photo'; 
      return `<img src="${item.url}?v=${Date.now()}" alt="${alt}" loading="lazy" />`;
    }

    //Postman API endpoints - POST  
    //Showcase - Gallery
    fetch('/api/photos?section=gallery')
      .then(res => res.json())
      .then(items => {
        items.sort(newest);
        const gallery = document.getElementById('photo-gallery');   
        items.forEach(item => {
          const figure = document.createElement('figure');
          figure.className = 'photo-card';
          figure.innerHTML = `
            ${img(item, 'Tattoo Photo')}
          <article class="card-description">
            <h2>${item.title || 'New Ink'}</h2>
            <p>${item.style || ''}</p>
          </article>
          `;
          gallery.prepend(figure);
        });
      })
      .catch( error => console.error('Gallery load failed:', error));   
    //Popular - Gallery
    fetch('/api/photos?section=popular')
    .then(res => res.json())
    .then(items => {
      items.sort(newest);
      const popular = document.getElementById('popular-gallery-container'); 
      items.forEach(item => {
        const figure = document.createElement('figure');
        figure.className = 'gallery-item';
        figure.innerHTML = img(item, 'Tattoo photo');
        popular.prepend(figure);
      });
    })
    .catch( error => console.error('Gallery load failed:', error)); 
    //Award - Gallery
    fetch('/api/photos?section=awards')
    .then(res => res.json())
    .then(items => {
      const award = document.getElementById('carousel-inner');  
      items.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'carousel-item';
        slide.innerHTML = `
          <figure class="carousel-img-container">
            ${img(item, 'Award')}
          </figure>
          <article class="award-description">
            <p>${item.title || ''}</p>
          </article>
        `;
        award.prepend(slide);
      });
    })
    .catch( error => console.error('Gallery load failed:', error)); 
    
      //Postman API endpoints - DELETE  
      function deletePhoto(filename) {
        fetch(`/api/photos/${filename}`, {
          method: 'DELETE'
        })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete');
          return res.json();
        })
        .then(data => {
          console.log('Deleted', data); 
          document.querySelector(`[data-filename="${filename}"]`)?.remove();
        })
        .catch(err => console.error(err));
      }

});