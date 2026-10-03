import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const dataDirectory = path.join(projectRoot, 'src', 'data');
const imageDirectory = path.join(projectRoot, 'public', 'images', 'products');

const categories = [
  {
    slug: 'guitars',
    name: 'Guitars',
    color: '#8c4f2b',
    items: [
      'Acoustic Guitar',
      'Electric Guitar',
      'Classical Guitar',
      'Bass Guitar',
      'Travel Guitar',
    ],
    specs: {
      Type: 'String instrument',
      Material: 'Seasoned tonewood',
      Strings: '6',
      Warranty: '1 year',
    },
  },
  {
    slug: 'keyboards',
    name: 'Keyboards',
    color: '#415a77',
    items: ['Portable Keyboard', 'Digital Piano', 'MIDI Keyboard', 'Stage Piano', 'Synthesizer'],
    specs: {
      Type: 'Electronic keyboard',
      Keys: '61',
      Includes: 'Power adapter',
      Warranty: '2 years',
    },
  },
  {
    slug: 'percussion',
    name: 'Percussion',
    color: '#a33b20',
    items: ['Cajon', 'Drum Kit', 'Djembe', 'Tambourine', 'Practice Pad'],
    specs: {
      Type: 'Percussion',
      Material: 'Wood and metal',
      Includes: 'Tuning key',
      Warranty: '1 year',
    },
  },
  {
    slug: 'indian-classical',
    name: 'Indian classical',
    color: '#a45c00',
    items: ['Sitar', 'Tabla Set', 'Bansuri', 'Tanpura', 'Harmonium'],
    specs: {
      Type: 'Indian classical',
      Material: 'Hand-finished wood',
      Includes: 'Protective cover',
      Warranty: '1 year',
    },
  },
  {
    slug: 'studio-audio',
    name: 'Studio audio',
    color: '#54478c',
    items: [
      'Studio Microphone',
      'Audio Interface',
      'Studio Monitor',
      'Mixing Console',
      'Monitor Headphones',
    ],
    specs: {
      Type: 'Studio equipment',
      Connectivity: 'USB and XLR',
      Includes: 'Cable',
      Warranty: '2 years',
    },
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    color: '#2d6a4f',
    items: [
      'Guitar Picks',
      'Instrument Cable',
      'Folding Stand',
      'Digital Metronome',
      'Padded Gig Bag',
    ],
    specs: {
      Type: 'Musical accessory',
      Material: 'Mixed materials',
      Includes: 'Storage pouch',
      Warranty: '6 months',
    },
  },
];

const brands = ['Swara', 'Melodia', 'BeatBox', 'Raaga', 'StudioOne'];

/** Escape dynamic labels before placing them inside an SVG text node. */
function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/** Build a lightweight local placeholder so the catalogue never depends on remote images. */
function buildSvg(category, view) {
  const subtitle = view === 1 ? 'Front view' : 'Detail view';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(category.name)} placeholder</title>
  <desc id="description">A simple local placeholder for a TuneTown ${escapeXml(category.name)} product.</desc>
  <rect width="960" height="720" fill="#f4efe4"/>
  <circle cx="480" cy="310" r="180" fill="${category.color}" opacity="0.16"/>
  <rect x="280" y="180" width="400" height="260" rx="48" fill="${category.color}"/>
  <path d="M360 510h240" stroke="${category.color}" stroke-width="18" stroke-linecap="round"/>
  <text x="480" y="560" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="#182019">${escapeXml(category.name)}</text>
  <text x="480" y="615" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#4b5b50">${subtitle}</text>
</svg>`;
}

/**
 * Create ten predictable products per category. Predictable values make tests
 * repeatable while still covering missing discounts, zero discounts, low stock,
 * out-of-stock items, long titles, decimals, and a broken image.
 */
function buildProducts() {
  return categories.flatMap((category, categoryIndex) =>
    Array.from({ length: 10 }, (_, itemIndex) => {
      const sequence = categoryIndex * 10 + itemIndex + 1;
      const baseName = category.items[itemIndex % category.items.length];
      const edition = itemIndex < 5 ? 'Essential' : 'Performance';
      const longSuffix =
        itemIndex === 8
          ? ' with Carry Case, Learning Guide, Cable and Complete Beginner Accessory Pack'
          : '';
      const price = sequence === 60 ? 19.99 : sequence === 59 ? 1299.5 : 899 + sequence * 437.25;
      const product = {
        id: `${category.slug}-${String(itemIndex + 1).padStart(3, '0')}`,
        title: `${brands[sequence % brands.length]} ${edition} ${baseName}${longSuffix}`,
        description: `A dependable ${baseName.toLowerCase()} for practice, lessons, performances, and everyday music making.`,
        category: category.name,
        brand: brands[sequence % brands.length],
        price: Number(price.toFixed(2)),
        rating: Number((3.5 + (sequence % 15) / 10).toFixed(1)),
        stock: itemIndex === 0 ? 0 : itemIndex === 1 ? 3 : 5 + ((sequence * 7) % 24),
        specs: {
          ...category.specs,
          Dimensions: `${40 + itemIndex * 2} × ${20 + itemIndex} × ${8 + (itemIndex % 4)} cm`,
        },
        thumbnail:
          sequence === 57
            ? '/images/products/missing-image.svg'
            : `/images/products/${category.slug}-1.svg`,
        images: [
          `/images/products/${category.slug}-1.svg`,
          `/images/products/${category.slug}-2.svg`,
        ],
        createdAt: new Date(Date.UTC(2025, 0, sequence)).toISOString(),
      };

      if (itemIndex % 4 === 1) product.discountPercentage = 0;
      if (itemIndex % 4 === 2) product.discountPercentage = 10;
      if (itemIndex % 4 === 3) product.discountPercentage = 20;

      return product;
    }),
  );
}

await mkdir(dataDirectory, { recursive: true });
await mkdir(imageDirectory, { recursive: true });

const products = buildProducts();
await writeFile(
  path.join(dataDirectory, 'products.json'),
  `${JSON.stringify(products, null, 2)}\n`,
);

for (const category of categories) {
  await writeFile(path.join(imageDirectory, `${category.slug}-1.svg`), buildSvg(category, 1));
  await writeFile(path.join(imageDirectory, `${category.slug}-2.svg`), buildSvg(category, 2));
}

await writeFile(
  path.join(imageDirectory, 'fallback.svg'),
  buildSvg({ name: 'Image unavailable', color: '#68736b' }, 1),
);

console.log(`Generated ${products.length} products and ${categories.length * 2 + 1} local images.`);
