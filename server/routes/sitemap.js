const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Blog = require('../models/Blog');

// GET /sitemap.xml - Dynamic sitemap generation
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL?.split(',')[0]?.replace(/\/$/, '') || 'https://growphone.in';
    const currentDate = new Date().toISOString().split('T')[0];

    // Get all active services and blogs
    const [services, blogs] = await Promise.all([
      Service.find({ isActive: true }).sort({ orderIndex: 1 }),
      Blog.find({ status: 'published' }).sort({ createdAt: -1 })
    ]);

    // Generate sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    // Add service pages
    services.forEach(service => {
      const lastmod = service.updatedAt ? service.updatedAt.toISOString().split('T')[0] : currentDate;
      sitemap += `
  <url>
    <loc>${baseUrl}/services/${service.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add blog pages
    blogs.forEach(blog => {
      const lastmod = blog.updatedAt ? blog.updatedAt.toISOString().split('T')[0] : currentDate;
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${blog._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    // Set proper headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(sitemap);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
