const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Sample data
const data = [
  ['Category', 'Question', 'Answer'],
  [
    'About',
    'What is Kenmark ITan Solutions?',
    'Kenmark ITan Solutions is a leading technology company specializing in innovative IT solutions, AI integration, and digital transformation services. We help businesses leverage cutting-edge technology to achieve their goals.'
  ],
  [
    'About',
    'When was the company founded?',
    'Kenmark ITan Solutions has been serving clients with excellence in technology solutions for several years, building a strong reputation in the industry.'
  ],
  [
    'Services',
    'What services are offered?',
    'We offer a wide range of services including: IT consulting, AI solutions development, digital transformation, cloud services, software development, and technology training programs.'
  ],
  [
    'Services',
    'Do you provide AI consulting?',
    'Yes, we specialize in AI consulting services, helping businesses integrate artificial intelligence into their operations to improve efficiency and drive innovation.'
  ],
  [
    'Services',
    'What training programs do you offer?',
    'We offer comprehensive technology training programs covering AI, cloud computing, software development, and digital transformation strategies.'
  ],
  [
    'Contact',
    'How can I contact the company?',
    'You can contact us through our website at kenmarkitan.com, visit our contact page, or reach out via email for inquiries.'
  ],
  [
    'Contact',
    'Where is the company located?',
    'For location details and office addresses, please visit our website at kenmarkitan.com or contact us directly.'
  ],
  [
    'FAQ',
    'Do you offer remote services?',
    'Yes, we provide remote consulting and services to clients worldwide, ensuring flexibility and accessibility.'
  ],
  [
    'FAQ',
    'What industries do you serve?',
    'We serve various industries including healthcare, finance, manufacturing, retail, and technology sectors, providing tailored solutions for each.'
  ],
  [
    'FAQ',
    'How long does a typical project take?',
    'Project timelines vary based on scope and complexity. We work closely with clients to establish realistic timelines and deliver quality results on schedule.'
  ]
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(data);

// Set column widths
ws['!cols'] = [
  { wch: 15 }, // Category
  { wch: 40 }, // Question
  { wch: 80 }  // Answer
];

XLSX.utils.book_append_sheet(wb, ws, 'Knowledge Base');

// Write file
const filePath = path.join(publicDir, 'sample-knowledge.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`✅ Sample Excel file created at: ${filePath}`);

