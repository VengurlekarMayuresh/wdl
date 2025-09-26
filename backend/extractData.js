import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractData() {
  try {
    console.log('🔄 Extracting data from data.json...');
    
    // Read the original data.json
    const dataPath = path.join(__dirname, 'data/data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const parsedData = JSON.parse(rawData);
    
    console.log(`📊 Found:`);
    console.log(`   👨‍⚕️ Doctors: ${parsedData.doctors?.length || 0}`);
    console.log(`   👥 Patients: ${parsedData.patients?.length || 0}`);
    console.log(`   🏥 Care Providers: ${parsedData.careProviders?.length || 0}`);
    
    // Create separate doctors.json (overwrite existing)
    if (parsedData.doctors && parsedData.doctors.length > 0) {
      const doctorsPath = path.join(__dirname, 'data/doctors.json');
      fs.writeFileSync(doctorsPath, JSON.stringify(parsedData.doctors, null, 2));
      console.log(`✅ Created doctors.json with ${parsedData.doctors.length} doctors`);
    }
    
    // Create separate patients.json (overwrite existing)
    if (parsedData.patients && parsedData.patients.length > 0) {
      const patientsPath = path.join(__dirname, 'data/patients.json');
      fs.writeFileSync(patientsPath, JSON.stringify(parsedData.patients, null, 2));
      console.log(`✅ Created patients.json with ${parsedData.patients.length} patients`);
    }
    
    // Create separate careProviders.json if needed
    if (parsedData.careProviders && parsedData.careProviders.length > 0) {
      const careProvidersPath = path.join(__dirname, 'data/careProviders.json');
      fs.writeFileSync(careProvidersPath, JSON.stringify(parsedData.careProviders, null, 2));
      console.log(`✅ Created careProviders.json with ${parsedData.careProviders.length} care providers`);
    }
    
    console.log('\n📁 Files created successfully!');
    console.log('🗑️ You can now delete data.json if no longer needed');
    
  } catch (error) {
    console.error('❌ Error extracting data:', error.message);
  }
}

extractData();