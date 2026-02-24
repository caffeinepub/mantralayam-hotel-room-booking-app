// Permanent Customer Details localStorage module with CRUD operations and event dispatching

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'mantralayam_customers';

// Normalize phone number for consistent keying (remove spaces, dashes, etc.)
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '').trim();
}

// Generate deterministic customer ID from phone number
function generateCustomerId(phone: string): string {
  return `customer-${normalizePhone(phone)}`;
}

// Get all customers
export function getAllCustomers(): Customer[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const customers = JSON.parse(data);
    return Array.isArray(customers) ? customers : [];
  } catch (error) {
    console.error('Error loading customers:', error);
    return [];
  }
}

// Get customer by ID
export function getCustomerById(id: string): Customer | null {
  const customers = getAllCustomers();
  return customers.find(c => c.id === id) || null;
}

// Get customer by phone number
export function getCustomerByPhone(phone: string): Customer | null {
  const id = generateCustomerId(phone);
  return getCustomerById(id);
}

// Upsert customer (create or update)
export function upsertCustomer(name: string, phone: string): Customer {
  const customers = getAllCustomers();
  const id = generateCustomerId(phone);
  const now = new Date().toISOString();
  
  const existingIndex = customers.findIndex(c => c.id === id);
  
  let customer: Customer;
  
  if (existingIndex >= 0) {
    // Update existing customer
    customer = {
      ...customers[existingIndex],
      name: name.trim(),
      phone: phone.trim(),
      updatedAt: now,
    };
    customers[existingIndex] = customer;
  } else {
    // Create new customer
    customer = {
      id,
      name: name.trim(),
      phone: phone.trim(),
      createdAt: now,
      updatedAt: now,
    };
    customers.push(customer);
  }
  
  saveCustomers(customers);
  return customer;
}

// Update customer
export function updateCustomer(id: string, updates: Partial<Pick<Customer, 'name' | 'phone'>>): Customer | null {
  const customers = getAllCustomers();
  const index = customers.findIndex(c => c.id === id);
  
  if (index < 0) return null;
  
  const customer = {
    ...customers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  customers[index] = customer;
  saveCustomers(customers);
  return customer;
}

// Delete customer
export function deleteCustomer(id: string): boolean {
  const customers = getAllCustomers();
  const filtered = customers.filter(c => c.id !== id);
  
  if (filtered.length === customers.length) return false;
  
  saveCustomers(filtered);
  return true;
}

// Save customers and dispatch update event
function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    // Dispatch update event for reactive UI
    window.dispatchEvent(new CustomEvent('customersUpdated', { detail: customers }));
  } catch (error) {
    console.error('Error saving customers:', error);
  }
}

// Search customers by name or phone
export function searchCustomers(query: string): Customer[] {
  const customers = getAllCustomers();
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) return customers;
  
  return customers.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) ||
    c.phone.includes(lowerQuery)
  );
}
