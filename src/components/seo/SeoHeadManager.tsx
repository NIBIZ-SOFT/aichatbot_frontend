"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface SeoMetadata {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  author?: string;
  robots?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  og_type?: string;
  og_site_name?: string;
  og_locale?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;
  twitter_creator?: string;
  google_site_verification?: string;
  bing_site_verification?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  facebook_pixel_id?: string;
  schema_org_name?: string;
  schema_org_url?: string;
  schema_org_logo?: string;
  schema_application_category?: string;
  schema_price_currency?: string;
  schema_price_min?: number;
  schema_rating_value?: number;
  schema_review_count?: number;
}

export default function SeoHeadManager() {
  const [seo, setSeo] = useState<SeoMetadata | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getPublicSeoMetadata()
      .then((data) => {
        if (isMounted && data) {
          setSeo(data);
          applySeoToDocument(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch dynamic SEO metadata, using defaults:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const applySeoToDocument = (data: SeoMetadata) => {
    if (typeof document === "undefined") return;

    // 1. Update Title
    if (data.meta_title) {
      document.title = data.meta_title;
    }

    // Helper to set or create meta tag
    const setMeta = (nameOrProperty: "name" | "property", key: string, value?: string) => {
      if (!value) return;
      let el = document.querySelector(`meta[${nameOrProperty}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(nameOrProperty, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    // Helper to set link tag
    const setLink = (rel: string, href?: string) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // 2. Core Meta
    setMeta("name", "description", data.meta_description);
    setMeta("name", "keywords", data.meta_keywords);
    setMeta("name", "author", data.author || "Jobab Chat Enterprise");
    setMeta("name", "robots", data.robots || "index, follow");
    setLink("canonical", data.canonical_url || "https://jobab.chat");

    // 3. Open Graph
    setMeta("property", "og:title", data.og_title || data.meta_title);
    setMeta("property", "og:description", data.og_description || data.meta_description);
    setMeta("property", "og:image", data.og_image_url);
    setMeta("property", "og:url", data.canonical_url || "https://jobab.chat");
    setMeta("property", "og:type", data.og_type || "website");
    setMeta("property", "og:site_name", data.og_site_name || "Jobab Chat");
    setMeta("property", "og:locale", data.og_locale || "en_US");

    // 4. Twitter / X Card
    setMeta("name", "twitter:card", data.twitter_card || "summary_large_image");
    setMeta("name", "twitter:title", data.twitter_title || data.og_title || data.meta_title);
    setMeta("name", "twitter:description", data.twitter_description || data.og_description || data.meta_description);
    setMeta("name", "twitter:image", data.twitter_image_url || data.og_image_url);
    if (data.twitter_creator) {
      setMeta("name", "twitter:creator", data.twitter_creator);
      setMeta("name", "twitter:site", data.twitter_creator);
    }

    // 5. Search Engine Verifications
    if (data.google_site_verification) {
      setMeta("name", "google-site-verification", data.google_site_verification);
    }
    if (data.bing_site_verification) {
      setMeta("name", "msvalidate.01", data.bing_site_verification);
    }

    // 6. Schema.org Structured Data (JSON-LD)
    const structuredSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "name": data.schema_org_name || "Jobab Chat",
          "applicationCategory": data.schema_application_category || "BusinessApplication",
          "operatingSystem": "All Web Browsers, Cloud SaaS",
          "url": data.schema_org_url || "https://jobab.chat",
          "description": data.meta_description,
          "offers": {
            "@type": "Offer",
            "price": String(data.schema_price_min || 4990),
            "priceCurrency": data.schema_price_currency || "BDT"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": String(data.schema_rating_value || 4.9),
            "reviewCount": String(data.schema_review_count || 128)
          }
        },
        {
          "@type": "Organization",
          "name": data.schema_org_name || "Jobab Chat",
          "url": data.schema_org_url || "https://jobab.chat",
          "logo": data.schema_org_logo || "https://jobab.chat/logo.png",
          "sameAs": [
            "https://facebook.com/jobabchat",
            "https://twitter.com/jobabchat",
            "https://linkedin.com/company/jobabchat"
          ]
        }
      ]
    };

    let schemaScript = document.getElementById("jobab-structured-data-jsonld");
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = "jobab-structured-data-jsonld";
      schemaScript.setAttribute("type", "application/ld+json");
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(structuredSchema);

    // 7. Google Analytics 4 Injection (if configured)
    if (data.google_analytics_id && !document.getElementById("jobab-ga4-script")) {
      const gaScript = document.createElement("script");
      gaScript.id = "jobab-ga4-script";
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${data.google_analytics_id}`;
      document.head.appendChild(gaScript);

      const gaInitScript = document.createElement("script");
      gaInitScript.id = "jobab-ga4-init";
      gaInitScript.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${data.google_analytics_id}');
      `;
      document.head.appendChild(gaInitScript);
    }

    // 8. Meta Pixel Injection (if configured)
    if (data.facebook_pixel_id && !document.getElementById("jobab-meta-pixel")) {
      const pixelScript = document.createElement("script");
      pixelScript.id = "jobab-meta-pixel";
      pixelScript.textContent = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${data.facebook_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(pixelScript);
    }
  };

  return null; // Head manager component injects directly into DOM head
}
