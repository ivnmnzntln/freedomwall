# SPEAK UP Freedom Wall

This project splits the SPEAK UP Freedom Wall into a static frontend and Netlify Functions backend.

## Structure
- frontend: Static site assets (HTML/CSS/JS).
- netlify/functions: Serverless functions for posts and support counts.

## Local development
1. Install Netlify CLI.
2. Run Netlify Dev in the project root.
3. Open the local URL and submit posts.

## API
- GET /.netlify/functions/posts: returns all posts.
- POST /.netlify/functions/posts: creates a post.
- POST /.netlify/functions/support: increments support for a post.

## Admin dashboard
- Open /admin.html for moderation.
- Set an ADMIN_TOKEN environment variable in Netlify.
- Use the same token in the admin dashboard to load and delete posts.

## Notes
- Data is stored using Netlify Blobs for cross-function persistence.
- For long-term scale, connect a database (e.g., Supabase or Airtable).
