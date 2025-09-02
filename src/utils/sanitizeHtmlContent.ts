import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content with enhanced security features
 * - Removes dangerous elements and attributes
 * - Adds rel="noopener noreferrer" to anchor tags
 * - Normalizes target attributes
 */
export const sanitizeHtmlContent = (html: string): string => {
  // Configure DOMPurify with security enhancements
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 
      'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'id', 'style', 'title'
    ],
    ALLOW_DATA_ATTR: false,
    // Hook to modify elements during sanitization
    HOOKS: {
      afterSanitizeAttributes: function(node: Element) {
        // Add security attributes to anchor tags
        if (node.tagName === 'A') {
          const href = node.getAttribute('href');
          if (href) {
            // Add rel="noopener noreferrer" for security
            node.setAttribute('rel', 'noopener noreferrer');
            
            // Normalize target attribute
            const target = node.getAttribute('target');
            if (target && target !== '_self') {
              node.setAttribute('target', '_blank');
            }
          }
        }
      }
    }
  };

  return DOMPurify.sanitize(html, config);
};

/**
 * Creates a secure window.open call with proper security attributes
 */
export const secureWindowOpen = (url: string, target = '_blank', features = '') => {
  const secureFeatures = features ? `${features},noopener,noreferrer` : 'noopener,noreferrer';
  return window.open(url, target, secureFeatures);
};