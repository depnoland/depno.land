FROM denoland/deno:1.36.3

# The port that your application listens to.
EXPOSE 8080

WORKDIR /

# Prefer not to run as root.
USER deno

# These steps will be re-run upon each file change in your working directory:
COPY . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache index.ts

CMD ["run", "-A", "index.ts"]