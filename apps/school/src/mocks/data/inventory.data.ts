import { faker } from '@faker-js/faker'
import type {
  Asset,
  StockItem,
  StockAdjustment,
  PurchaseOrder,
  Vendor,
  AssetCategory,
  AssetCondition,
  StockCategory,
} from '@/features/inventory/types/inventory.types'

// ==================== ASSETS ====================

const assetCategories: AssetCategory[] = ['furniture', 'electronics', 'sports', 'lab_equipment', 'other']
const assetConditions: AssetCondition[] = ['new', 'good', 'fair', 'poor']
const locations = ['Main Building', 'Lab Block', 'Sports Complex', 'Library', 'Admin Block', 'Auditorium']
const departments = ['Administration', 'Academic', 'Science Lab', 'Computer Lab', 'Library', 'Sports']

export const assets: Asset[] = []

// Furniture
for (let i = 0; i < 30; i++) {
  const purchaseDate = faker.date.past({ years: 5 })
  const purchasePrice = 5000 + Math.floor(Math.random() * 25000)
  const depreciationRate = 10
  const yearsOld = (Date.now() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
  const currentValue = Math.max(0, purchasePrice * Math.pow(1 - depreciationRate / 100, yearsOld))

  assets.push({
    id: `asset-furn-${i + 1}`,
    name: faker.helpers.arrayElement(['Student Desk', 'Office Chair', 'Teacher Table', 'Steel Cupboard', 'Wooden Bench', 'Book Shelf']),
    category: 'furniture',
    assetCode: `FRN-${String(i + 1).padStart(4, '0')}`,
    serialNumber: undefined,
    purchaseDate: purchaseDate.toISOString().split('T')[0],
    purchasePrice,
    currentValue: Math.round(currentValue),
    depreciationRate,
    location: faker.helpers.arrayElement(locations),
    assignedTo: faker.helpers.arrayElement(departments),
    assignedToType: 'department',
    condition: faker.helpers.arrayElement(assetConditions),
    status: Math.random() > 0.9 ? 'maintenance' : 'active',
    createdAt: purchaseDate.toISOString(),
  })
}

// Electronics
for (let i = 0; i < 25; i++) {
  const purchaseDate = faker.date.past({ years: 3 })
  const purchasePrice = 15000 + Math.floor(Math.random() * 85000)
  const depreciationRate = 20
  const yearsOld = (Date.now() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
  const currentValue = Math.max(0, purchasePrice * Math.pow(1 - depreciationRate / 100, yearsOld))

  assets.push({
    id: `asset-elec-${i + 1}`,
    name: faker.helpers.arrayElement(['Desktop Computer', 'Laptop', 'Projector', 'Smart Board', 'Printer', 'Scanner', 'CCTV Camera']),
    category: 'electronics',
    assetCode: `ELC-${String(i + 1).padStart(4, '0')}`,
    serialNumber: faker.string.alphanumeric(12).toUpperCase(),
    purchaseDate: purchaseDate.toISOString().split('T')[0],
    purchasePrice,
    currentValue: Math.round(currentValue),
    depreciationRate,
    location: faker.helpers.arrayElement(locations),
    assignedTo: faker.helpers.arrayElement(departments),
    assignedToType: 'department',
    condition: faker.helpers.arrayElement(assetConditions),
    warrantyExpiry: faker.date.future({ years: 2 }).toISOString().split('T')[0],
    lastMaintenanceDate: faker.date.recent({ days: 180 }).toISOString().split('T')[0],
    nextMaintenanceDate: faker.date.soon({ days: 90 }).toISOString().split('T')[0],
    status: Math.random() > 0.85 ? 'maintenance' : 'active',
    createdAt: purchaseDate.toISOString(),
  })
}

// Lab Equipment
for (let i = 0; i < 20; i++) {
  const purchaseDate = faker.date.past({ years: 4 })
  const purchasePrice = 10000 + Math.floor(Math.random() * 50000)
  const depreciationRate = 15
  const yearsOld = (Date.now() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
  const currentValue = Math.max(0, purchasePrice * Math.pow(1 - depreciationRate / 100, yearsOld))

  assets.push({
    id: `asset-lab-${i + 1}`,
    name: faker.helpers.arrayElement(['Microscope', 'Bunsen Burner', 'Test Tube Stand', 'Beaker Set', 'Oscilloscope', 'Voltmeter']),
    category: 'lab_equipment',
    assetCode: `LAB-${String(i + 1).padStart(4, '0')}`,
    serialNumber: faker.string.alphanumeric(10).toUpperCase(),
    purchaseDate: purchaseDate.toISOString().split('T')[0],
    purchasePrice,
    currentValue: Math.round(currentValue),
    depreciationRate,
    location: 'Science Lab',
    assignedTo: 'Science Lab',
    assignedToType: 'department',
    condition: faker.helpers.arrayElement(assetConditions),
    status: 'active',
    createdAt: purchaseDate.toISOString(),
  })
}

// Sports Equipment
for (let i = 0; i < 15; i++) {
  const purchaseDate = faker.date.past({ years: 2 })
  const purchasePrice = 2000 + Math.floor(Math.random() * 20000)
  const depreciationRate = 25
  const yearsOld = (Date.now() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
  const currentValue = Math.max(0, purchasePrice * Math.pow(1 - depreciationRate / 100, yearsOld))

  assets.push({
    id: `asset-sports-${i + 1}`,
    name: faker.helpers.arrayElement(['Football', 'Cricket Kit', 'Badminton Set', 'Basketball', 'Table Tennis Table', 'Gymnasium Equipment']),
    category: 'sports',
    assetCode: `SPT-${String(i + 1).padStart(4, '0')}`,
    purchaseDate: purchaseDate.toISOString().split('T')[0],
    purchasePrice,
    currentValue: Math.round(currentValue),
    depreciationRate,
    location: 'Sports Complex',
    assignedTo: 'Sports',
    assignedToType: 'department',
    condition: faker.helpers.arrayElement(assetConditions),
    status: 'active',
    createdAt: purchaseDate.toISOString(),
  })
}

// ==================== STOCK ITEMS ====================

const stockCategories: StockCategory[] = ['stationery', 'cleaning', 'lab_consumables', 'medical', 'other']
const units = ['Piece', 'Box', 'Pack', 'Ream', 'Bottle', 'Set', 'Kg', 'Liter']

export const stockItems: StockItem[] = [
  { id: 'stock-1', name: 'A4 Paper Ream', category: 'stationery', sku: 'STN-001', unit: 'Ream', currentStock: 45, minimumStock: 20, reorderLevel: 30, unitPrice: 250, location: 'Store Room A', lastRestocked: '2025-01-05', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-2', name: 'Blue Ballpoint Pens (Pack of 10)', category: 'stationery', sku: 'STN-002', unit: 'Pack', currentStock: 120, minimumStock: 50, reorderLevel: 75, unitPrice: 45, location: 'Store Room A', lastRestocked: '2025-01-10', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-3', name: 'Whiteboard Marker Set', category: 'stationery', sku: 'STN-003', unit: 'Set', currentStock: 30, minimumStock: 15, reorderLevel: 25, unitPrice: 120, location: 'Store Room A', lastRestocked: '2025-01-08', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-4', name: 'Chalk Box (100 pcs)', category: 'stationery', sku: 'STN-004', unit: 'Box', currentStock: 25, minimumStock: 10, reorderLevel: 15, unitPrice: 85, location: 'Store Room A', lastRestocked: '2025-01-02', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-5', name: 'Stapler Pins Box', category: 'stationery', sku: 'STN-005', unit: 'Box', currentStock: 60, minimumStock: 20, reorderLevel: 35, unitPrice: 25, location: 'Store Room A', lastRestocked: '2024-12-20', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-6', name: 'Floor Cleaner (5L)', category: 'cleaning', sku: 'CLN-001', unit: 'Bottle', currentStock: 8, minimumStock: 5, reorderLevel: 10, unitPrice: 350, location: 'Store Room B', lastRestocked: '2025-01-03', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-7', name: 'Hand Sanitizer (500ml)', category: 'cleaning', sku: 'CLN-002', unit: 'Bottle', currentStock: 35, minimumStock: 20, reorderLevel: 30, unitPrice: 180, location: 'Store Room B', lastRestocked: '2025-01-12', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-8', name: 'Phenyl (5L)', category: 'cleaning', sku: 'CLN-003', unit: 'Bottle', currentStock: 12, minimumStock: 8, reorderLevel: 10, unitPrice: 280, location: 'Store Room B', lastRestocked: '2025-01-08', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-9', name: 'Broom', category: 'cleaning', sku: 'CLN-004', unit: 'Piece', currentStock: 15, minimumStock: 8, reorderLevel: 12, unitPrice: 120, location: 'Store Room B', lastRestocked: '2024-12-15', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-10', name: 'Test Tubes (Pack of 10)', category: 'lab_consumables', sku: 'LAB-001', unit: 'Pack', currentStock: 18, minimumStock: 10, reorderLevel: 15, unitPrice: 150, location: 'Science Lab Store', lastRestocked: '2025-01-05', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-11', name: 'Litmus Paper Pack', category: 'lab_consumables', sku: 'LAB-002', unit: 'Pack', currentStock: 22, minimumStock: 10, reorderLevel: 15, unitPrice: 45, location: 'Science Lab Store', lastRestocked: '2025-01-10', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-12', name: 'Hydrochloric Acid (500ml)', category: 'lab_consumables', sku: 'LAB-003', unit: 'Bottle', currentStock: 6, minimumStock: 5, reorderLevel: 8, unitPrice: 280, location: 'Science Lab Store', lastRestocked: '2024-12-28', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-13', name: 'First Aid Kit Refill', category: 'medical', sku: 'MED-001', unit: 'Set', currentStock: 5, minimumStock: 3, reorderLevel: 5, unitPrice: 850, location: 'Medical Room', lastRestocked: '2025-01-02', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-14', name: 'Bandages Roll', category: 'medical', sku: 'MED-002', unit: 'Roll', currentStock: 25, minimumStock: 15, reorderLevel: 20, unitPrice: 35, location: 'Medical Room', lastRestocked: '2025-01-08', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'stock-15', name: 'Cotton Roll (500g)', category: 'medical', sku: 'MED-003', unit: 'Roll', currentStock: 10, minimumStock: 5, reorderLevel: 8, unitPrice: 120, location: 'Medical Room', lastRestocked: '2025-01-10', createdAt: '2024-01-01T00:00:00Z' },
]

// ==================== STOCK ADJUSTMENTS ====================

export const stockAdjustments: StockAdjustment[] = []

for (let i = 0; i < 30; i++) {
  const stockItem = stockItems[Math.floor(Math.random() * stockItems.length)]
  const adjustmentType = faker.helpers.arrayElement(['in', 'out', 'adjustment'] as const)

  stockAdjustments.push({
    id: `adj-${i + 1}`,
    stockItemId: stockItem.id,
    stockItemName: stockItem.name,
    type: adjustmentType,
    quantity: adjustmentType === 'in' ? 10 + Math.floor(Math.random() * 50) : -(1 + Math.floor(Math.random() * 10)),
    reason: adjustmentType === 'in' ? 'Stock Replenishment' : adjustmentType === 'out' ? 'Consumed/Issued' : 'Physical Count Adjustment',
    reference: adjustmentType === 'in' ? `PO-${faker.string.numeric(6)}` : undefined,
    adjustedBy: faker.helpers.arrayElement(['Admin', 'Store Keeper', 'Manager']),
    createdAt: faker.date.recent({ days: 60 }).toISOString(),
  })
}

// ==================== VENDORS ====================

export const vendors: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'ABC Stationery Supplies',
    contactPerson: 'Rajesh Kumar',
    phone: '+91 9876543210',
    email: 'sales@abcstationery.com',
    address: '45, Industrial Area, Bangalore - 560001',
    gstNumber: 'GST29ABCDE1234F1Z5',
    categories: ['stationery'],
    rating: 4.5,
    totalOrders: 45,
    status: 'active',
    createdAt: '2020-01-01T00:00:00Z',
  },
  {
    id: 'vendor-2',
    name: 'Lab Equipment India',
    contactPerson: 'Dr. Suresh Menon',
    phone: '+91 9876543211',
    email: 'info@labequipmentindia.com',
    address: '78, Science Park, Bangalore - 560003',
    gstNumber: 'GST29LBEQUIP1234G2Z6',
    categories: ['lab_consumables'],
    rating: 4.8,
    totalOrders: 28,
    status: 'active',
    createdAt: '2019-06-15T00:00:00Z',
  },
  {
    id: 'vendor-3',
    name: 'CleanTech Solutions',
    contactPerson: 'Priya Sharma',
    phone: '+91 9876543212',
    email: 'orders@cleantech.in',
    address: '23, MIDC, Bangalore - 560004',
    gstNumber: 'GST29CLNTECH1234H3Z7',
    categories: ['cleaning'],
    rating: 4.2,
    totalOrders: 36,
    status: 'active',
    createdAt: '2021-03-20T00:00:00Z',
  },
  {
    id: 'vendor-4',
    name: 'MediCare Supplies',
    contactPerson: 'Dr. Anita Rao',
    phone: '+91 9876543213',
    email: 'supply@medicare.in',
    address: '56, Health City, Bangalore - 560005',
    gstNumber: 'GST29MEDICARE1234I4Z8',
    categories: ['medical'],
    rating: 4.6,
    totalOrders: 22,
    status: 'active',
    createdAt: '2020-08-10T00:00:00Z',
  },
  {
    id: 'vendor-5',
    name: 'Tech Electronics Ltd',
    contactPerson: 'Vivek Patel',
    phone: '+91 9876543214',
    email: 'sales@techelectronics.com',
    address: '89, IT Park, Bangalore - 560002',
    gstNumber: 'GST29TECHELEC1234J5Z9',
    categories: ['other'],
    rating: 4.4,
    totalOrders: 18,
    status: 'active',
    createdAt: '2021-11-05T00:00:00Z',
  },
]

// ==================== PURCHASE ORDERS ====================

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2025-0001',
    vendorId: 'vendor-1',
    vendorName: 'ABC Stationery Supplies',
    items: [
      { id: 'poi-1', itemName: 'A4 Paper Ream', quantity: 50, unitPrice: 250, totalPrice: 12500 },
      { id: 'poi-2', itemName: 'Blue Ballpoint Pens (Pack of 10)', quantity: 100, unitPrice: 45, totalPrice: 4500 },
      { id: 'poi-3', itemName: 'Whiteboard Marker Set', quantity: 30, unitPrice: 120, totalPrice: 3600 },
    ],
    totalAmount: 20600,
    status: 'received',
    createdBy: 'admin-1',
    createdByName: 'Administrator',
    approvedBy: 'principal-1',
    approvedByName: 'Dr. Anil Kumar',
    orderDate: '2025-01-05',
    expectedDelivery: '2025-01-10',
    receivedDate: '2025-01-10',
    notes: 'Monthly stationery order',
    createdAt: '2025-01-02T00:00:00Z',
  },
  {
    id: 'po-2',
    poNumber: 'PO-2025-0002',
    vendorId: 'vendor-3',
    vendorName: 'CleanTech Solutions',
    items: [
      { id: 'poi-4', itemName: 'Floor Cleaner (5L)', quantity: 10, unitPrice: 350, totalPrice: 3500 },
      { id: 'poi-5', itemName: 'Hand Sanitizer (500ml)', quantity: 50, unitPrice: 180, totalPrice: 9000 },
    ],
    totalAmount: 12500,
    status: 'ordered',
    createdBy: 'admin-1',
    createdByName: 'Administrator',
    approvedBy: 'principal-1',
    approvedByName: 'Dr. Anil Kumar',
    orderDate: '2025-01-15',
    expectedDelivery: '2025-01-20',
    notes: 'Cleaning supplies replenishment',
    createdAt: '2025-01-12T00:00:00Z',
  },
  {
    id: 'po-3',
    poNumber: 'PO-2025-0003',
    vendorId: 'vendor-2',
    vendorName: 'Lab Equipment India',
    items: [
      { id: 'poi-6', itemName: 'Test Tubes (Pack of 10)', quantity: 20, unitPrice: 150, totalPrice: 3000 },
      { id: 'poi-7', itemName: 'Litmus Paper Pack', quantity: 30, unitPrice: 45, totalPrice: 1350 },
    ],
    totalAmount: 4350,
    status: 'pending_approval',
    createdBy: 'admin-1',
    createdByName: 'Administrator',
    notes: 'Lab consumables for science practicals',
    createdAt: '2025-01-18T00:00:00Z',
  },
  {
    id: 'po-4',
    poNumber: 'PO-2025-0004',
    vendorId: 'vendor-4',
    vendorName: 'MediCare Supplies',
    items: [
      { id: 'poi-8', itemName: 'First Aid Kit Refill', quantity: 5, unitPrice: 850, totalPrice: 4250 },
      { id: 'poi-9', itemName: 'Bandages Roll', quantity: 30, unitPrice: 35, totalPrice: 1050 },
    ],
    totalAmount: 5300,
    status: 'draft',
    createdBy: 'admin-1',
    createdByName: 'Administrator',
    notes: 'Medical supplies for school clinic',
    createdAt: '2025-01-20T00:00:00Z',
  },
]
