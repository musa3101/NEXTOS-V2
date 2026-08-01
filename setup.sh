#!/bin/bash
git checkout dev 2>/dev/null || git checkout -b dev
npm install
npm run dev
