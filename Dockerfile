FROM oven/bun:latest

WORKDIR /app

# Copy only the bundled output
COPY dist/server.js .
COPY .env .
# (optional) copy package.json if you use it for metadata
# COPY package.json .

EXPOSE 3000

CMD ["bun", "server.js"]
