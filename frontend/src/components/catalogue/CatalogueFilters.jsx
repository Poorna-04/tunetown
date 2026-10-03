import PropTypes from 'prop-types';

export default function CatalogueFilters({
  values,
  categories,
  counts,
  brands,
  onChange,
  onClear,
}) {
  function toggleBrand(brand) {
    const nextBrands = values.brands.includes(brand)
      ? values.brands.filter((item) => item !== brand)
      : [...values.brands, brand];
    onChange('brands', nextBrands);
  }

  return (
    <aside className="filters" aria-label="Product filters">
      <div className="section-heading">
        <h2>Filters</h2>
        <button type="button" className="text-button" onClick={onClear}>
          Clear all
        </button>
      </div>
      <label>
        Category
        <select
          value={values.category}
          onChange={(event) => onChange('category', event.target.value)}
        >
          <option value="">All categories ({counts.all})</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category} ({counts[category] ?? 0})
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Brands</legend>
        {brands.map((brand) => (
          <label className="check-label" key={brand}>
            <input
              type="checkbox"
              checked={values.brands.includes(brand)}
              onChange={() => toggleBrand(brand)}
            />
            {brand}
          </label>
        ))}
      </fieldset>
      <label>
        Minimum rating
        <select
          value={values.minRating}
          onChange={(event) => onChange('minRating', event.target.value)}
        >
          <option value="">Any rating</option>
          <option value="4">4 stars and above</option>
          <option value="3">3 stars and above</option>
        </select>
      </label>
      <div className="price-inputs">
        <label>
          Min price
          <input
            type="number"
            min="0"
            value={values.minPrice}
            onChange={(event) => onChange('minPrice', event.target.value)}
          />
        </label>
        <label>
          Max price
          <input
            type="number"
            min="0"
            value={values.maxPrice}
            onChange={(event) => onChange('maxPrice', event.target.value)}
          />
        </label>
      </div>
    </aside>
  );
}

CatalogueFilters.propTypes = {
  values: PropTypes.object.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  counts: PropTypes.object.isRequired,
  brands: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};
