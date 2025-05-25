-- Export glazing_requirements table contents
\copy (SELECT * FROM glazing_requirements) TO 'glazing_requirements.csv' WITH CSV HEADER;
