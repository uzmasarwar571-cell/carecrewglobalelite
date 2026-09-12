/**
 * Applies the SEO settings managed in the admin panel to the live
 * <head>. index.html still ships sensible defaults so a crawler that
 * does not run JavaScript still sees real metadata.
 */

import { settings } from '../config/settings';
import { businessConfig } from '../config/business';

export function applySeo() {
  if (typeof document === 'undefined') return;

  const seo = settings.seo || {};
  const siteUrl = (businessConfig.siteUrl || '').replace(/\/$/, '');
  const ogImage = absoluteUrl(seo.ogImage, siteUrl);

  if (seo.title) {
    document.title = seo.title;
    setMeta('property', 'og:title', seo.title);
    setMeta('name', 'twitter:title', seo.title);
  }

  if (seo.description) {
    setMeta('name', 'description', seo.description);
    setMeta('property', 'og:description', seo.description);
    setMeta('name', 'twitter:description', seo.description);
  }

  if (seo.keywords) setMeta('name', 'keywords', seo.keywords);
  if (ogImage) {
    setMeta('property', 'og:image', ogImage);
    setMeta('name', 'twitter:image', ogImage);
  }

  if (siteUrl) {
    setMeta('property', 'og:url', `${siteUrl}/`);
    setLink('canonical', `${siteUrl}/`);
  }

  setMeta('property', 'og:site_name', businessConfig.name);
  setMeta('name', 'robots', seo.indexable === false ? 'noindex, nofollow' : 'index, follow');
}

function absoluteUrl(path, siteUrl) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function setMeta(attribute, key, content) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

export default applySeo;
