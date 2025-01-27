import React, { useState } from "react";
import { db } from "../firebase"; // Ensure this is correctly configured in your Firebase file
import { collection, addDoc } from "firebase/firestore";

const DataInc = () => {
  const [meterId, setMeterId] = useState("");
  const [reading, setReading] = useState("");
  const [readingDate, setReadingDate] = useState("");

  // Function to handle form submission and add a reading
  const handleAddReading = async (e) => {
    e.preventDefault();

    if (!meterId || !reading || !readingDate) {
      alert("All fields are required!");
      return;
    }

    try {
      await addDoc(collection(db, "readings"), {
        meterId,
        reading: parseFloat(reading),
        readingDate,
      });
      alert("Reading added successfully!");
      setMeterId("");
      setReading("");
      setReadingDate("");
    } catch (err) {
      console.error("Error adding reading: ", err);
      alert("Error adding reading. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Data Insertion</h1>

      {/* Add Reading Form */}
      <form onSubmit={handleAddReading} className="space-y-4">
        <div>
          <label htmlFor="meterId" className="block font-medium mb-1">
            Meter ID:
          </label>
          <input
            type="text"
            id="meterId"
            value={meterId}
            onChange={(e) => setMeterId(e.target.value)}
            placeholder="Enter Meter ID"
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label htmlFor="reading" className="block font-medium mb-1">
            Reading:
          </label>
          <input
            type="number"
            id="reading"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            placeholder="Enter Reading"
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label htmlFor="readingDate" className="block font-medium mb-1">
            Date of Reading:
          </label>
          <input
            type="date"
            id="readingDate"
            value={readingDate}
            onChange={(e) => setReadingDate(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default DataInc;
