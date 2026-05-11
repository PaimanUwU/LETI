# LETI

# Installation Guides

```
mkdir LETI_Project_Working_Folder
cd LETI_Project_Working_Folder

uv init
uv add django django-vite
uv run --active django-admin startproject LETI .

uv init
uv add django django-vite
uv run django-admin startproject LETI .

npm init vite@latest frontend --yes -- --template vanilla-ts

cd frontend
npm install

cd ..
```

# Test development server

## For django backend
```bash

# Apply database migrations
uv run python manage.py migrate

# Start the Django development server
uv run python manage.py runserver

```

## For frontend
```bash
cd frontend

# Install dependencies (if you haven't already)
npm install

# Start the Vite development server
npm run dev

```


