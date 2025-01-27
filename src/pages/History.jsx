import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Ensure your Firebase configuration is correctly set up and imported
import { collection, query, orderBy, getDocs } from "firebase/firestore";

const History = () => {
  const [meterReadings, setMeterReadings] = useState([]);

  useEffect(() => {
    const fetchMeterReadings = async () => {
      try {
        const readingsQuery = query(
          collection(db, "readings"),
          orderBy("meterId")
        );
        const querySnapshot = await getDocs(readingsQuery);

        const readingsByMeterId = {};

        querySnapshot.forEach((doc) => {
          const reading = doc.data();
          const { meterId } = reading;

          // Group readings by meterId
          if (!readingsByMeterId[meterId]) {
            readingsByMeterId[meterId] = [];
          }
          readingsByMeterId[meterId].push(reading);
        });

        setMeterReadings(readingsByMeterId);
      } catch (error) {
        console.error("Error fetching meter readings:", error);
      }
    };

    fetchMeterReadings();
  }, []);

  return (
    <div className="p-6">
     

      <section>
        <h2 className="text-2xl font-semibold mb-4">History</h2>

        {Object.keys(meterReadings).length === 0 ? (
          <p className="text-gray-600">Loading meter readings...</p>
        ) : (
          <div>
            {Object.entries(meterReadings).map(([meterId, readings]) => (
              <div key={meterId} className="mb-6 border p-4 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-gray-700 mb-2">Meter ID: {meterId}</h3>

                {readings.map((reading, index) => (
                  <div key={index} className="mb-4">
                    <p className="text-gray-800">Reading: {reading.reading}</p>
                    <p className="text-gray-600">Date: {reading.readingDate}</p>
                    <hr className="my-2 border-gray-300" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-10 text-center text-gray-500">
        <p>&copy; 2024 Electricity Meter Readings. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default History;
