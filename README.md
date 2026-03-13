# Global Development Dashboard

A full-stack data analytics platform for exploring global development indicators such as GDP, inflation, poverty rate, and life expectancy.

Global Development Dashboard combines **data science, backend APIs, and interactive visualizations** to transform raw economic datasets into an intuitive analytics dashboard.

The project demonstrates how a modern data product is built end-to-end: data processing, API development, and frontend visualization.

---

## Features

- Interactive dashboards for macroeconomic indicators
- Visualization of global trends over time
- Country-level comparisons
- Clean API for accessing processed data
- Reproducible data science pipeline
- Monorepo architecture combining data science, backend, and frontend

---

## Tech Stack

### Frontend

- React
- TypeScript
- Data visualization libraries for charts and dashboards

### Backend

- Fastify
- REST API endpoints for analytics data

### Data Science

- Python
- Jupyter Notebook
- Data cleaning and feature engineering scripts

### Version Control

- Git
- GitHub pull request workflow

---

## Data Sources

The dataset includes global development indicators such as:

- GDP
- Inflation
- Poverty rate
- Life expectancy

Data is processed and normalized in the data science pipeline before being exposed through API endpoints.

Potential sources include organizations such as:

- World Bank
- International Monetary Fund
- United Nations

---

## Architecture

Raw Dataset
↓
Python Data Processing
↓
Processed Dataset (JSON / CSV)
↓
Fastify Backend API
↓
React Dashboard

The data science pipeline transforms raw economic datasets into structured outputs consumed by the backend API. The frontend dashboard then visualizes the data through charts and interactive components.

---

## Project Structure

global-development-dashboard/
│
├── client/ # React dashboard
│
├── server/ # Fastify backend API
│
├── data-science/ # notebooks and data pipelines
│
├── shared/ # shared types/interfaces
│
└── README.md

---

## Example API Endpoints

GET /analytics/gdp
GET /analytics/inflation
GET /analytics/life-expectancy
GET /analytics/poverty-rate
GET /analytics/country/:countryCode

---

## Running the Project

### 1. Clone the repository

git clone <https://github.com/yourusername/global-development-dashboard.git>

### 2. Install dependencies

npm install

### 3. Start the development servers

### 4. Run the data pipeline

cd data-science
pip install -r requirements.txt
python scripts/process_data.py

---

## Goals of the Project

This project aims to demonstrate:

- building a full-stack data product
- integrating data science workflows with production APIs
- designing interactive data visualizations
- structuring a professional monorepo

---

## Future Improvements

- predictive models for economic indicators
- more datasets and indicators
- advanced visualizations
- caching layer for faster analytics queries
- automated data refresh pipeline

---
