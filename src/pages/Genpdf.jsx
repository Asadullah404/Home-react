import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { db } from '../firebase'; // Import db from your firebase.js file
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const GenPDF = () => {
  const [meterIds, setMeterIds] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedMeterIds, setSelectedMeterIds] = useState([]);

  useEffect(() => {
    fetchMeterIds();
  }, []);

  // Fetch meter IDs from Firestore
  const fetchMeterIds = async () => {
    const readingsRef = collection(db, 'readings');
    const readingsSnapshot = await getDocs(readingsRef);
    let meterIdsSet = new Set();
    readingsSnapshot.forEach((doc) => {
      meterIdsSet.add(doc.data().meterId);
    });
    setMeterIds([...meterIdsSet]);
  };

  // Generate PDF
 // Generate PDF
const generatePDF = async (e) => {
  e.preventDefault();

  if (!fromDate || !toDate || selectedMeterIds.length === 0) {
    alert("Please select meter IDs and dates.");
    return;
  }

  const doc = new jsPDF();
  let y = 40; // Adjusted starting position to make space for the logo

  // Add a logo to the PDF
  const logo = 'data:image/png;base64,<your-base64-image-here>'; // Replace with your logo Base64 or import it
  doc.addImage(logo, 'PNG', 10, 10, 50, 30); // x=10, y=10, width=50, height=30

  const readingsRef = collection(db, 'readings');
  const q = query(
    readingsRef,
    where('meterId', 'in', selectedMeterIds)
  );
  const querySnapshot = await getDocs(q);
  let readingsByMeter = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (!readingsByMeter[data.meterId]) {
      readingsByMeter[data.meterId] = [];
    }
    readingsByMeter[data.meterId].push(data);
  });

  Object.keys(readingsByMeter).forEach((meterId) => {
    if (y + 20 > doc.internal.pageSize.height) {
      doc.addPage();
      y = 40; // Adjusted for the logo on new pages
    }
    doc.text(`Meter ID: ${meterId}`, 20, y);
    y += 10;

    let tableData = readingsByMeter[meterId].map((reading) => {
      let readingDate = new Date(reading.readingDate);
      return [readingDate.toDateString(), reading.reading];
    });

    doc.autoTable({
      head: [['Date', 'Reading']],
      body: tableData,
      startY: y,
      theme: 'striped',
    });

    y = doc.autoTable.previous.finalY + 10;
  });

  doc.save('readings_report.pdf');
};


  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg max-w-2xl">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Generate PDF of History Readings</h1>
      <form onSubmit={generatePDF} className="space-y-4">
        <div>
          <label htmlFor="pdfMeterIds" className="block text-gray-700 font-medium">Meter IDs:</label>
          <select
            id="pdfMeterIds"
            multiple
            value={selectedMeterIds}
            onChange={(e) => setSelectedMeterIds(Array.from(e.target.selectedOptions, option => option.value))}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {meterIds.map((meterId) => (
              <option key={meterId} value={meterId}>{meterId}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pdfFromDate" className="block text-gray-700 font-medium">From Date:</label>
          <input
            type="date"
            id="pdfFromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="pdfToDate" className="block text-gray-700 font-medium">To Date:</label>
          <input
            type="date"
            id="pdfToDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
            className="mt-2 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Generate PDF
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenPDF;
