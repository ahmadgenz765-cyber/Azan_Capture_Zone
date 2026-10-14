/* ==========================================================================
   AZAN CAPTURE ZONE - LIGHTBOX GALLERY SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Create Lightbox HTML Structure Dynamically
  const lightboxHTML = `
    <div id="lightbox" class="lightbox-modal">
      <span class="lightbox-close">&times;</span>
      <button class="lightbox-prev" aria-label="Previous image">&#10094;</button>
      <img class="lightbox-img" src="" alt="Enlarged Portfolio Image">
      <button class="lightbox-next" aria-label="Next image">&#10095;</button>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = lightboxHTML;
  document.body.appendChild(div);

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  const galleryImages = document.querySelectorAll('.gallery-img');
  let currentIndex = 0;
  const imageSources = Array.from(galleryImages).map(img => img.src);

  // Open Lightbox on Image Click
  galleryImages.forEach((img, index) => {
    img.addEventListener('click', () => {
      currentIndex = index;
      lightboxImg.src = imageSources[currentIndex];
      lightbox.classList.add('active');
    });
  });

  // Close Lightbox
  const closeLightbox = () => {
    lightbox.classList.remove('active');
  };

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Next & Previous Navigation
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % imageSources.length;
    lightboxImg.src = imageSources[currentIndex];
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + imageSources.length) % imageSources.length;
    lightboxImg.src = imageSources[currentIndex];
  });

  // Keyboard navigation (Escape to close, Arrow keys for navigation)
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
  });
});