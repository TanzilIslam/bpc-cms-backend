# Start dev (build and run)
docker-compose -f docker-compose.dev.yml up --build

# Start dev in background
docker-compose -f docker-compose.dev.yml up -d --build

# Stop dev
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Run migrations
docker-compose -f docker-compose.dev.yml exec app npm run migration:run

# Access app shell
docker-compose -f docker-compose.dev.yml exec app sh

# Access MySQL
docker-compose -f docker-compose.dev.yml exec mysql mysql -u cms_user -p

# Remove the volumes to start fresh
docker-compose -f docker-compose.dev.yml down -v