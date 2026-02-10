# Static site served by Nginx
FROM nginx:1.27-alpine

# Custom Nginx config: no directory listing + cache static assets
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy site files
COPY . /usr/share/nginx/html

# Very small hardening: remove default server tokens in headers
RUN sed -i 's/server_tokens on;/server_tokens off;/g' /etc/nginx/nginx.conf || true
