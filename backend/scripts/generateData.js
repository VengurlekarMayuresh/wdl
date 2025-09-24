#!/usr/bin/env node

import generateAllSampleData from '../utils/generateSampleData.js';

console.log('🚀 Starting sample data generation...');
console.log('This will generate:');
console.log('  • 100 Doctors with complete profiles and specialties');
console.log('  • 100 Patients with medical histories and information');
console.log('  • 100 Care Providers with services and availability');
console.log('  • Sample appointments linking doctors and patients');
console.log('  • All with profile pictures and realistic data');
console.log('');

// Run the generation
await generateAllSampleData();

process.exit(0);