-- Export glazing_panel_requirements table contents
\copy (SELECT * FROM glazing_panel_requirements) TO 'glazing_panel_requirements.csv' WITH CSV HEADER;
