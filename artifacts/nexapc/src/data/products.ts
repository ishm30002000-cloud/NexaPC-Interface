/**
 * NexaPC catalog — the ONLY product data source.
 * Rules: real manufacturer models only, facts limited to widely published
 * manufacturer specifications. Prices and stock are NOT PROVIDED yet, so they
 * are `null` and the UI shows "Price pending" / "Availability pending".
 * Product photos: only real manufacturer/retailer photos (see SOURCES.md).
 * When a photo is missing, `images` is empty and the UI shows an explicit
 * "Photo pending" frame. Never use AI-generated images for real products.
 */

export type CategorySlug =
  | 'ssd-storage'
  | 'pc-cooling'
  | 'graphics-cards'
  | 'gaming-monitors'
  | 'processors'
  | 'memory'
  | 'accessories';

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Where the photo came from — mirrored in SOURCES.md */
  source: string;
}

export interface ProductSpec {
  label: string;
  value: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  /** Price in integer fils (1 KWD = 1000 fils). null = not provided yet. */
  priceFils: number | null;
  /** Units in stock. null = not provided yet. 0 = out of stock. */
  stock: number | null;
  images: ProductImage[];
  shortDescription: string;
  description: string;
  specs: ProductSpec[];
  featured: boolean;
  featuredMonitor?: boolean;
  isPlaceholder?: boolean;
  /** Public reference used to verify the listed facts. */
  reference?: string;
}

export const CATEGORIES: { slug: CategorySlug; name: string; blurb: string }[] = [
  { slug: 'ssd-storage', name: 'SSD Storage', blurb: 'NVMe and SATA drives for faster boots and loads.' },
  { slug: 'pc-cooling', name: 'PC Cooling Systems', blurb: 'Air coolers that keep clocks steady under load.' },
  { slug: 'graphics-cards', name: 'Graphics Cards', blurb: 'GPUs for high refresh gaming and creation.' },
  { slug: 'gaming-monitors', name: 'Gaming Monitors', blurb: 'High refresh panels from Samsung, SADES and MSI.' },
  { slug: 'processors', name: 'Processors', blurb: 'Desktop CPUs for gaming builds.' },
  { slug: 'memory', name: 'RAM', blurb: 'DDR5 memory kits.' },
  { slug: 'accessories', name: 'Gaming Accessories', blurb: 'Mice and peripherals.' },
];

export const products: Product[] = [
  {
    id: 'p-samsung-990pro-2tb',
    slug: 'samsung-990-pro-2tb',
    name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 SSD',
    brand: 'Samsung',
    category: 'ssd-storage',
    priceFils: null,
    stock: null,
    images: [{ src: 'products/samsung-990-pro.jpg', alt: 'Samsung 990 PRO 2TB SSD', width: 800, height: 600, source: 'https://images.samsung.com/is/image/samsung/p6pim/us/mz-v9p2t0b-am/gallery/us-990pro-nvme-m2-ssd-mz-v9p2t0b-am-551141316' }],
    shortDescription: 'PCIe 4.0 NVMe M.2 2280 SSD with sequential reads up to 7,450 MB/s.',
    description:
      'The Samsung 990 PRO is a PCIe 4.0 NVMe SSD in the M.2 2280 form factor. Samsung rates the 2TB model for sequential reads up to 7,450 MB/s and sequential writes up to 6,900 MB/s.',
    specs: [
      { label: 'Model code', value: 'MZ-V9P2T0' },
      { label: 'Capacity', value: '2TB' },
      { label: 'Interface', value: 'PCIe 4.0 x4, NVMe 2.0' },
      { label: 'Form factor', value: 'M.2 2280' },
      { label: 'Sequential read', value: 'Up to 7,450 MB/s' },
      { label: 'Sequential write', value: 'Up to 6,900 MB/s' },
    ],
    featured: true,
    reference: 'https://semiconductor.samsung.com/consumer-storage/internal-ssd/990-pro/',
  },
  {
    id: 'p-samsung-870evo-1tb',
    slug: 'samsung-870-evo-1tb',
    name: 'Samsung 870 EVO 1TB SATA 2.5" SSD',
    brand: 'Samsung',
    category: 'ssd-storage',
    priceFils: null,
    stock: null,
    images: [{ src: 'products/samsung-870-evo.jpg', alt: 'Samsung 870 EVO 1TB SATA SSD', width: 1600, height: 1200, source: 'https://images.samsung.com/is/image/samsung/p6pim/us/mz-77e1t0b-am/gallery/us-sata-ssd-mz-77e1t0b-am-----evo---tb-ssd-sata-----inch-black-553784918' }],
    shortDescription: '2.5-inch SATA SSD rated up to 560 MB/s read and 530 MB/s write.',
    description:
      'The Samsung 870 EVO is a 2.5-inch SATA III SSD. Samsung rates sequential reads up to 560 MB/s and sequential writes up to 530 MB/s.',
    specs: [
      { label: 'Model code', value: 'MZ-77E1T0' },
      { label: 'Capacity', value: '1TB' },
      { label: 'Interface', value: 'SATA 6 Gb/s' },
      { label: 'Form factor', value: '2.5-inch' },
      { label: 'Sequential read', value: 'Up to 560 MB/s' },
      { label: 'Sequential write', value: 'Up to 530 MB/s' },
    ],
    featured: false,
    reference: 'https://semiconductor.samsung.com/consumer-storage/internal-ssd/870evo/',
  },
  {
    id: 'p-samsung-odyssey-g5-27',
    slug: 'samsung-odyssey-g5-27-lc27g55t',
    name: 'Samsung Odyssey G5 27" Curved QHD Gaming Monitor',
    brand: 'Samsung',
    category: 'gaming-monitors',
    priceFils: null,
    stock: null,
    images: [{ src: 'products/samsung-g5.jpg', alt: 'Samsung Odyssey G5 27-inch curved monitor', width: 1000, height: 1000, source: 'https://product.newcomme.com/wp-content/uploads/2022/07/samsung-27-g5-odyssey-gaming-monitor-with-1000r-curved-screen-lc27g55tqwmxue-4-1.png' }],
    shortDescription: '27-inch 1000R curved WQHD panel at 144Hz with 1ms response time.',
    description:
      'The Samsung Odyssey G5 (LC27G55T) is a 27-inch 1000R curved gaming monitor with a 2560 x 1440 resolution, 144Hz refresh rate and 1ms (MPRT) response time.',
    specs: [
      { label: 'Model code', value: 'LC27G55TQB' },
      { label: 'Screen size', value: '27-inch' },
      { label: 'Resolution', value: '2560 x 1440 (WQHD)' },
      { label: 'Refresh rate', value: '144Hz' },
      { label: 'Response time', value: '1ms (MPRT)' },
      { label: 'Curvature', value: '1000R' },
    ],
    featured: true,
    featuredMonitor: true,
    reference: 'https://www.samsung.com/levant/monitors/gaming/odyssey-g5-27-inch-144hz-curved-wqhd-lc27g55tqbmxzn/',
  },
  {
    id: 'p-sades-ap-frog-27',
    slug: 'sades-ap-frog-27-qhd-gaming-monitor',
    name: 'SADES AP-FROG 27" QHD Gaming Monitor',
    brand: 'SADES',
    category: 'gaming-monitors',
    priceFils: null,
    stock: null,
    images: [
      {
        src: 'products/sades-ap-frog.webp',
        alt: 'SADES AP-FROG 27-inch flat gaming monitor, front view',
        width: 1280,
        height: 1280,
        source:
          'https://retrogameskw.com/cdn/shop/files/sades-27-qhdhdmi-21180hz-03msflat-gaming-monitor-ap-frog-gaming-monitor-sades-445714.webp?v=1745847070&width=1280',
      },
    ],
    shortDescription: '27-inch flat QHD gaming monitor listed at 180Hz with HDMI 2.1.',
    description:
      'The SADES AP-FROG is a 27-inch flat QHD gaming monitor. Facts shown are taken from the Kuwait retailer listing title (QHD, HDMI 2.1, 180Hz, 0.3ms, flat). Full manufacturer specifications are still to be supplied.',
    specs: [
      { label: 'Model', value: 'AP-FROG' },
      { label: 'Screen size', value: '27-inch' },
      { label: 'Resolution class', value: 'QHD' },
      { label: 'Refresh rate', value: '180Hz' },
      { label: 'Response time', value: '0.3ms (as listed by retailer)' },
      { label: 'Video input', value: 'HDMI 2.1' },
      { label: 'Panel shape', value: 'Flat' },
      { label: 'Panel type', value: null },
    ],
    featured: true,
    featuredMonitor: true,
    reference:
      'https://retrogameskw.com/cdn/shop/files/sades-27-qhdhdmi-21180hz-03msflat-gaming-monitor-ap-frog-gaming-monitor-sades-445714.webp',
  },
  {
    id: 'p-msi-g274qpf-e2',
    slug: 'msi-g274qpf-e2',
    name: 'MSI G274QPF E2 27" Rapid IPS Gaming Monitor',
    brand: 'MSI',
    category: 'gaming-monitors',
    priceFils: null,
    stock: null,
    images: [{ src: 'products/msi-g274qpf.webp', alt: 'MSI G274QPF E2 gaming monitor, front view', width: 639, height: 501, source: 'https://images.versus.io/objects/msi-g274qpf-e2-27.front.master2x.1734618822442.webp' }],
    shortDescription: '27-inch WQHD Rapid IPS panel at 180Hz with 1ms GtG response.',
    description:
      'The MSI G274QPF E2 is a 27-inch flat gaming monitor with a Rapid IPS panel, 2560 x 1440 resolution, 180Hz refresh rate and 1ms (GtG) response time.',
    specs: [
      { label: 'Screen size', value: '27-inch' },
      { label: 'Panel type', value: 'Rapid IPS' },
      { label: 'Resolution', value: '2560 x 1440 (WQHD)' },
      { label: 'Refresh rate', value: '180Hz' },
      { label: 'Response time', value: '1ms (GtG)' },
    ],
    featured: true,
    featuredMonitor: true,
    reference: 'https://www.msi.com/Monitor/G274QPF-E2',
  },
  {
    id: 'p-msi-rtx4070s-ventus2x',
    slug: 'msi-geforce-rtx-4070-super-12g-ventus-2x-oc',
    name: 'MSI GeForce RTX 4070 SUPER 12G VENTUS 2X OC',
    brand: 'MSI',
    category: 'graphics-cards',
    priceFils: null,
    stock: null,
    images: [{ src: 'products/msi-4070.webp', alt: 'MSI RTX 4070 SUPER VENTUS 2X OC graphics card', width: 1000, height: 800, source: 'https://storage-asset.msi.com/global/picture/product/product_1704699652044a1802bd893b86b7a5fc3313b6fc22.webp' }],
    shortDescription: 'Dual-fan GeForce RTX 4070 SUPER with 12GB GDDR6X memory.',
    description:
      'MSI VENTUS 2X OC edition of the NVIDIA GeForce RTX 4070 SUPER, with 12GB of GDDR6X memory on a 192-bit interface and a PCI Express 4.0 interface.',
    specs: [
      { label: 'GPU', value: 'NVIDIA GeForce RTX 4070 SUPER' },
      { label: 'Memory', value: '12GB GDDR6X' },
      { label: 'Memory interface', value: '192-bit' },
      { label: 'Bus interface', value: 'PCI Express 4.0' },
      { label: 'Cooling', value: 'Dual fan (VENTUS 2X)' },
    ],
    featured: true,
    reference: 'https://www.msi.com/Graphics-Card/GeForce-RTX-4070-SUPER-12G-VENTUS-2X-OC',
  },
  {
    id: 'p-noctua-nh-d15',
    slug: 'noctua-nh-d15',
    name: 'Noctua NH-D15 Dual-Tower CPU Cooler',
    brand: 'Noctua',
    category: 'pc-cooling',
    priceFils: null,
    stock: null,
    images: [{ src: 'products/noctua-d15.jpg', alt: 'Noctua NH-D15 dual-tower CPU cooler', width: 1806, height: 1806, source: 'https://www.density.sk/wp-content/uploads/nh_d15_4_8.jpg' }],
    shortDescription: 'Dual-tower air cooler with two NF-A15 140mm fans.',
    description:
      'The Noctua NH-D15 is a dual-tower CPU air cooler supplied with two NF-A15 PWM 140mm fans. Height with fans is 165mm.',
    specs: [
      { label: 'Type', value: 'Dual-tower air cooler' },
      { label: 'Fans included', value: '2 x NF-A15 PWM 140mm' },
      { label: 'Height (with fan)', value: '165mm' },
    ],
    featured: true,
    reference: 'https://noctua.at/en/nh-d15',
  },
  {
    id: 'p-amd-ryzen7-7800x3d',
    slug: 'amd-ryzen-7-7800x3d',
    name: 'AMD Ryzen 7 7800X3D Desktop Processor',
    brand: 'AMD',
    category: 'processors',
    priceFils: null,
    stock: null,
    images: [],
    shortDescription: '8 cores, 16 threads, 96MB L3 cache with 3D V-Cache on AM5.',
    description:
      'The AMD Ryzen 7 7800X3D is an AM5 desktop processor with 8 cores, 16 threads, 96MB of L3 cache using AMD 3D V-Cache technology and a max boost clock up to 5.0GHz.',
    specs: [
      { label: 'Cores / threads', value: '8 / 16' },
      { label: 'Max boost clock', value: 'Up to 5.0GHz' },
      { label: 'L3 cache', value: '96MB' },
      { label: 'Socket', value: 'AM5' },
      { label: 'Default TDP', value: '120W' },
    ],
    featured: true,
    reference: 'https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html',
  },
  {
    id: 'p-logitech-gprox-superlight2',
    slug: 'logitech-g-pro-x-superlight-2',
    name: 'Logitech G PRO X SUPERLIGHT 2 Wireless Gaming Mouse',
    brand: 'Logitech G',
    category: 'accessories',
    priceFils: null,
    stock: null,
    images: [{ src: 'products/logitech-superlight.png', alt: 'Logitech G PRO X SUPERLIGHT 2 mouse in black', width: 2500, height: 2160, source: 'https://resource.logitechg.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x-superlight-2/new-gallery-assets-2025/pro-x-superlight-2-mice-top-angle-black-gallery-1.png' }],
    shortDescription: 'Wireless LIGHTSPEED esports mouse with HERO 2 sensor, about 60g.',
    description:
      'The Logitech G PRO X SUPERLIGHT 2 is a wireless gaming mouse using LIGHTSPEED wireless and the HERO 2 sensor, with a weight of about 60g.',
    specs: [
      { label: 'Sensor', value: 'HERO 2' },
      { label: 'Connectivity', value: 'LIGHTSPEED wireless' },
      { label: 'Weight', value: '60g' },
    ],
    featured: false,
    reference: 'https://www.logitechg.com/products/gaming-mice/pro-x2-superlight-wireless-mouse.html',
  },
  {
    id: 'p-placeholder-memory',
    slug: 'placeholder-ddr5-memory-kit',
    name: 'Placeholder - replace with real product (DDR5 memory kit)',
    brand: 'Placeholder',
    category: 'memory',
    priceFils: null,
    stock: null,
    images: [],
    shortDescription: 'Placeholder entry. Supply the exact RAM model, specs, price and stock.',
    description: 'This is a placeholder slot for a RAM product. No specifications are shown until real data is supplied.',
    specs: [],
    featured: false,
    isPlaceholder: true,
  },
];
