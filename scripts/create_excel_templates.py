#!/usr/bin/env python3

import pandas as pd
import os

# Create directory for Excel templates if it doesn't exist
os.makedirs('excel_templates', exist_ok=True)

# Create template for glazing_panel_requirements
panel_columns = ['id', 'model', 'width', 'eave_height', 'section', 'bay', 'vent_type', 
                'material_type', 'panel_quantity', 'panel_length', 'notes']

# Sample data for glazing_panel_requirements
panel_data = [
    {'id': '', 'model': 'XYZ-100', 'width': 8, 'eave_height': 10, 'section': 'North', 
     'bay': '', 'vent_type': 'Side Vent', 'material_type': 'Glass', 'panel_quantity': 12, 
     'panel_length': 48, 'notes': 'Example data - please replace'}
]

# Create DataFrame
panel_df = pd.DataFrame(panel_data, columns=panel_columns)

# Create Excel file with formatting
with pd.ExcelWriter('excel_templates/glazing_panel_requirements_template.xlsx', engine='openpyxl') as writer:
    panel_df.to_excel(writer, index=False, sheet_name='Panel Requirements')
    
    # Get the workbook and the worksheet
    workbook = writer.book
    worksheet = writer.sheets['Panel Requirements']
    
    # Format header row
    for col_num, column in enumerate(panel_df.columns, 1):
        cell = worksheet.cell(row=1, column=col_num)
        cell.font = workbook.add_font({'bold': True})

# Create template for glazing_requirements
req_columns = ['id', 'model', 'width', 'eave_height', 'section', 'bay', 'vent_type', 
              'material_type', 'area_sq_ft', 'linear_ft', 'panel_width', 'notes']

# Sample data for glazing_requirements
req_data = [
    {'id': '', 'model': 'XYZ-100', 'width': 8, 'eave_height': 10, 'section': 'North', 
     'bay': '', 'vent_type': 'Side Vent', 'material_type': 'Glass', 'area_sq_ft': 120, 
     'linear_ft': 48, 'panel_width': 24, 'notes': 'Example data - please replace'}
]

# Create DataFrame
req_df = pd.DataFrame(req_data, columns=req_columns)

# Create Excel file with formatting
with pd.ExcelWriter('excel_templates/glazing_requirements_template.xlsx', engine='openpyxl') as writer:
    req_df.to_excel(writer, index=False, sheet_name='Requirements')
    
    # Get the workbook and the worksheet
    workbook = writer.book
    worksheet = writer.sheets['Requirements']
    
    # Format header row
    for col_num, column in enumerate(req_df.columns, 1):
        cell = worksheet.cell(row=1, column=col_num)
        cell.font = workbook.add_font({'bold': True})

print("Excel templates created successfully in the excel_templates directory:")
print("1. excel_templates/glazing_panel_requirements_template.xlsx")
print("2. excel_templates/glazing_requirements_template.xlsx")
