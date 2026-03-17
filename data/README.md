# Data pipeline (data science)

This folder holds raw inputs, the cleaning pipeline, and intermediate outputs that feed the dashboard database. The pipeline is implemented in a Jupyter notebook and loads results into the project SQLite DB.

## Tech

- **Python** with **pandas** for reshaping and cleaning; **sqlite3** (stdlib) to write to `db/dev.sqlite`.
- **Jupyter Notebook** for interactive runs and exploration; optional use of **matplotlib** and **seaborn** for checks.

## What was done

- **Inputs** (in `raw-data/`): World Bank-style data (`worldbank_data.csv`, `worldbank_metadata.csv`), country coordinates (`longitude-latitude.csv`), and optionally population data. Paths in the notebook are relative to `notebooks/` (e.g. `../raw-data/...`).
- **Notebook** (`notebooks/clean_data.ipynb`): Reads wide-format World Bank series, melts to long format (country, year, series, value), pivots to one row per country-year with columns per indicator. Joins with metadata (region, income) and lat/long. Builds two outputs:
  - **History:** All country-year rows written to `economic_history` in `../../db/dev.sqlite` (and optionally to `raw-data/economic_data_clean.csv`).
  - **Latest:** One row per country (latest year) written to `economic_latest` and optionally to `raw-data/economic_latest.csv`.
- **Outputs:** Clean CSV artifacts live under `raw-data/` (e.g. `economic_data_clean.csv`, `economic_latest.csv`). The canonical store for the app is SQLite; see `db/schema.sql` for table definitions.

## Running the pipeline

1. Install Python dependencies (pandas, and optionally matplotlib, seaborn, jupyter).
2. Place or generate the required CSVs in `data/raw-data/` (see notebook for exact filenames).
3. Run the notebook from `data/notebooks/` so that `../raw-data` and `../../db/dev.sqlite` resolve correctly. Ensure the DB exists and schema matches `db/schema.sql` before `to_sql` (create tables manually if the notebook does not).
4. After a successful run, restart or use the server so it reads the updated `db/dev.sqlite`.

## Folder layout

```
data/
├── README.md           # this file
├── raw-data/           # input CSVs and pipeline output CSVs
└── notebooks/          # clean_data.ipynb (main pipeline)
```
