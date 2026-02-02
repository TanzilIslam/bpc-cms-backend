# Docker Setup Guide - Dev & Production Sync

## Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose

## Development Setup (Windows with Docker)

### 1. Initial Setup
```bash
# Create .env file for development
cp .env.development .env

# Create required directories
mkdir uploads
mkdir docker/mysql/init
```

### 2. Start Development Environment
```bash
# Using Make (recommended)
make dev-build

# OR using docker-compose directly
docker-compose -f docker-compose.dev.yml up --build
```

### 3. Access Your Application
- API: http://localhost:3000
- MySQL: localhost:3306

### 4. View Logs
```bash
make dev-logs
# OR
docker-compose -f docker-compose.dev.yml logs -f
```

### 5. Run Migrations
```bash
make migrate
# OR
docker-compose -f docker-compose.dev.yml exec app npm run migration:run
```

### 6. Stop Development
```bash
make dev-down
# OR
docker-compose -f docker-compose.dev.yml down
```

---

## Production Deployment (Linux VPS)

### 1. On Your VPS Server
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Transfer Your Code
```bash
# On your local machine (Git recommended)
git push origin main

# On VPS
git clone your-repo-url
cd programming-club-cms
```

### 3. Configure Production
```bash
# Create production environment file
cp .env.production.example .env.production

# Edit with strong passwords and secrets
nano .env.production

# Use this for production
cp .env.production .env
```

### 4. Start Production
```bash
make prod-build
# OR
docker-compose -f docker-compose.prod.yml up --build -d
```

### 5. Run Migrations
```bash
make migrate-prod
```

### 6. Monitor Production
```bash
# View logs
make prod-logs

# Check status
docker-compose -f docker-compose.prod.yml ps
```

---

## Common Commands

### Development
```bash
make dev              # Start dev environment
make dev-build        # Build and start
make dev-down         # Stop dev environment
make dev-logs         # View logs
make shell            # Access app container shell
make mysql            # Access MySQL shell
make migrate          # Run migrations
```

### Production
```bash
make prod             # Start prod environment
make prod-build       # Build and start
make prod-down        # Stop prod environment
make prod-logs        # View logs
make migrate-prod     # Run migrations
```

### Cleanup
```bash
make clean            # Remove all containers and volumes
```

---

## Key Differences: Dev vs Prod

| Feature | Development | Production |
|---------|------------|------------|
| Hot Reload | ✅ Yes | ❌ No |
| MySQL Port | Exposed (3306) | Internal only |
| Volumes | Source code mounted | Only uploads/logs |
| Build | Development mode | Optimized build |
| User | Root | Non-root (nestjs) |
| Restart Policy | unless-stopped | always |

---

## Keeping Dev & Prod in Sync

1. **Use same Docker base images** - Both use `node:18-alpine`
2. **Environment variables** - Different `.env` files, same structure
3. **Database migrations** - Version controlled, run on both
4. **Volume mounts** - Same upload directory structure
5. **Git workflow** - Develop → Test → Push → Deploy

---

## Backup & Restore (Production)

### Backup Database
```bash
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u cms_user -p programming_club_cms > backup.sql
```

### Restore Database
```bash
docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u cms_user -p programming_club_cms < backup.sql
```

---

## Troubleshooting

### Container won't start
```bash
docker-compose -f docker-compose.dev.yml logs app
```

### Database connection failed
- Check if MySQL container is healthy: `docker ps`
- Verify environment variables in `.env`

### Port already in use
- Stop other services using port 3000 or 3306
- Or change ports in `.env` file