#!/bin/bash
cd /home/lw/projects/app-7z58i603if41
echo "Setting NODE_ENV to production for build..."
export NODE_ENV=production
echo "Running build..."
npm run build