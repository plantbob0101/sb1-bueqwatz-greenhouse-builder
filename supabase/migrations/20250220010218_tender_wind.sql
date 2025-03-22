-- Add product column to glazing_companies_pc8
ALTER TABLE glazing_companies_pc8
ADD COLUMN product text;

-- Add comment for documentation
COMMENT ON COLUMN glazing_companies_pc8.product
IS 'Product name or model number';