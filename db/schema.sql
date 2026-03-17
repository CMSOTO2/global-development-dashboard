CREATE TABLE economic_history (
  id INTEGER PRIMARY KEY,
  country_code TEXT,
  country_name TEXT,
  region TEXT,
  income TEXT,
  year INT,
  gdp_growth FLOAT,
  inflation FLOAT,
  life_expectancy FLOAT,
  poverty FLOAT
  latitude FLOAT,
  longitude FLOAT
  population INT,
  population_growth FLOAT,
);

CREATE TABLE economic_latest (
  id INTEGER PRIMARY KEY,
  country_code TEXT,
  country_name TEXT,
  region TEXT,
  income TEXT,
  year INT,
  gdp_growth FLOAT,
  inflation FLOAT,
  life_expectancy FLOAT,
  poverty FLOAT 
  latitude FLOAT,
  longitude FLOAT
  population INT,
  population_growth FLOAT,
);
