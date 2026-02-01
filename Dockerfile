# Stage 1: Build the binary
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy the bundled output
COPY dist/server.js .

# Build the standalone binary
RUN bun build --compile --outfile /app/server server.js

# Stage 2: Run the binary
FROM debian:bookworm-slim

WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/server /app/server
COPY .env /app/.env

EXPOSE 3000

CMD ["/app/server"]
