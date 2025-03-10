/**
 * Mobile Optimization Test Utility
 * Run this in the browser console to check mobile optimizations
 */

const runMobileTests = () => {
  console.log('%c Mobile Optimization Tests ', 'background: #4A7C59; color: white; padding: 4px; font-weight: bold;');
  
  // Test 1: Check viewport meta tag
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  console.log(
    '%c Viewport Meta Tag: ' + 
    (viewportMeta ? '✅ Present' : '❌ Missing'),
    'font-weight: bold;'
  );
  if (viewportMeta) {
    console.log('  Content: ' + viewportMeta.getAttribute('content'));
  }
  
  // Test 2: Check touch target sizes
  const touchTargets = document.querySelectorAll('button, a, .nav-link, input[type="checkbox"], input[type="radio"], select');
  let smallTouchTargets = [];
  
  touchTargets.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      smallTouchTargets.push({
        element: el,
        width: rect.width,
        height: rect.height
      });
    }
  });
  
  console.log(
    '%c Touch Targets (min 44x44px): ' + 
    (smallTouchTargets.length === 0 ? '✅ All good' : `❌ ${smallTouchTargets.length} issues found`),
    'font-weight: bold;'
  );
  
  if (smallTouchTargets.length > 0) {
    console.table(smallTouchTargets.map(item => ({
      Element: item.element.tagName + (item.element.className ? '.' + item.element.className.split(' ')[0] : ''),
      Width: Math.round(item.width) + 'px',
      Height: Math.round(item.height) + 'px'
    })));
  }
  
  // Test 3: Check font sizes for readability
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, label, button, input, a');
  let smallTextElements = [];
  
  textElements.forEach(el => {
    const fontSize = window.getComputedStyle(el).fontSize;
    const fontSizeNum = parseFloat(fontSize);
    if (fontSizeNum < 16) {
      smallTextElements.push({
        element: el,
        fontSize: fontSize
      });
    }
  });
  
  console.log(
    '%c Font Sizes (min 16px recommended): ' + 
    (smallTextElements.length === 0 ? '✅ All good' : `❌ ${smallTextElements.length} issues found`),
    'font-weight: bold;'
  );
  
  if (smallTextElements.length > 0) {
    console.table(smallTextElements.slice(0, 10).map(item => ({
      Element: item.element.tagName + (item.element.className ? '.' + item.element.className.split(' ')[0] : ''),
      'Font Size': item.fontSize,
      Text: item.element.textContent.substring(0, 20) + (item.element.textContent.length > 20 ? '...' : '')
    })));
    
    if (smallTextElements.length > 10) {
      console.log(`  ... and ${smallTextElements.length - 10} more elements with small text`);
    }
  }
  
  // Test 4: Check for horizontal overflow
  const bodyWidth = document.body.getBoundingClientRect().width;
  const windowWidth = window.innerWidth;
  const elements = Array.from(document.querySelectorAll('*'));
  const overflowingElements = elements.filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.right > windowWidth + 5; // 5px buffer for rounding errors
  });
  
  console.log(
    '%c Horizontal Overflow: ' + 
    (overflowingElements.length === 0 ? '✅ No overflow' : `❌ ${overflowingElements.length} overflowing elements`),
    'font-weight: bold;'
  );
  
  if (overflowingElements.length > 0) {
    console.log('  First 5 overflowing elements:');
    overflowingElements.slice(0, 5).forEach(el => {
      const rect = el.getBoundingClientRect();
      console.log(`  - ${el.tagName}${el.id ? '#'+el.id : ''}${el.className ? '.'+el.className.split(' ')[0] : ''}: width ${Math.round(rect.width)}px, right edge at ${Math.round(rect.right)}px (viewport width: ${windowWidth}px)`);
    });
  }
  
  // Test 5: Check if mobile detection is working
  const isMobileClass = document.body.classList.contains('mobile-device') || document.querySelector('.mobile-view');
  console.log(
    '%c Mobile Detection: ' + 
    (isMobileClass ? '✅ Detected as mobile' : '❌ Not detected as mobile'),
    'font-weight: bold;'
  );
  
  // Test 6: Check for responsive images
  const images = document.querySelectorAll('img');
  let nonResponsiveImages = [];
  
  images.forEach(img => {
    if (!img.hasAttribute('srcset') && !img.style.maxWidth) {
      nonResponsiveImages.push(img);
    }
  });
  
  console.log(
    '%c Responsive Images: ' + 
    (nonResponsiveImages.length === 0 ? '✅ All images are responsive' : `❌ ${nonResponsiveImages.length} non-responsive images`),
    'font-weight: bold;'
  );
  
  // Test 7: Check for PWA capabilities
  const hasManifest = !!document.querySelector('link[rel="manifest"]');
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasAppleTouchIcon = !!document.querySelector('link[rel="apple-touch-icon"]');
  
  console.log(
    '%c PWA Capabilities: ' + 
    ((hasManifest && hasServiceWorker && hasAppleTouchIcon) ? '✅ All set' : '⚠️ Partial implementation'),
    'font-weight: bold;'
  );
  console.log('  - Web App Manifest: ' + (hasManifest ? '✅' : '❌'));
  console.log('  - Service Worker API: ' + (hasServiceWorker ? '✅' : '❌'));
  console.log('  - Apple Touch Icon: ' + (hasAppleTouchIcon ? '✅' : '❌'));
  
  console.log('%c Test Complete ', 'background: #4A7C59; color: white; padding: 4px; font-weight: bold;');
  
  return {
    smallTouchTargets,
    smallTextElements,
    overflowingElements,
    nonResponsiveImages
  };
};

// Export for use in browser console or import
if (typeof window !== 'undefined') {
  window.runMobileTests = runMobileTests;
}

export default runMobileTests; 