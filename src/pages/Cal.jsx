import React, { useState } from "react";
import { db } from "../firebase"; // Ensure your Firebase config is properly imported
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const Cal = () => {
  const [searchMeterId, setSearchMeterId] = useState("");
  const [readings, setReadings] = useState([]);
  const [fromReading, setFromReading] = useState("");
  const [toReading, setToReading] = useState("");
  const [dateRangeResult, setDateRangeResult] = useState("");
  const [prevReading, setPrevReading] = useState("");
  const [currReading, setCurrReading] = useState("");
  const [readingPeriod, setReadingPeriod] = useState("Inst");
  const [unitsResult, setUnitsResult] = useState("");
  const [watts, setWatts] = useState("");
  const [hours, setHours] = useState("");
  const [wattHourResult, setWattHourResult] = useState("");

  // Fetch readings for a given meter ID
  const fetchReadings = async (e) => {
    e.preventDefault();
    setDateRangeResult("");

    try {
      const q = query(
        collection(db, "readings"),
        where("meterId", "==", searchMeterId),
        orderBy("readingDate")
      );
      const querySnapshot = await getDocs(q);
      const fetchedReadings = [];
      querySnapshot.forEach((doc) => fetchedReadings.push(doc.data()));

      setReadings(fetchedReadings);

      if (fetchedReadings.length < 2) {
        setDateRangeResult("Not enough data to calculate units used.");
        return;
      }
    } catch (error) {
      console.error("Error fetching readings:", error);
      setDateRangeResult("Error fetching readings. Please try again later.");
    }
  };

  // Calculate units used within a date range
  const calculateUnitsUsedFromDateRange = (e) => {
    e.preventDefault();

    const fromValue = parseFloat(fromReading);
    const toValue = parseFloat(toReading);

    if (toValue <= fromValue) {
      setDateRangeResult("To reading must be greater than from reading.");
      return;
    }

    const unitsUsed = toValue - fromValue;
    setDateRangeResult(`Units used: ${unitsUsed}`);
  };

  // Calculate units per day, week, or month
  const calculateUnits = (e) => {
    e.preventDefault();

    const prevValue = parseFloat(prevReading);
    const currValue = parseFloat(currReading);

    if (currValue <= prevValue) {
      setUnitsResult("Current reading must be greater than previous reading.");
      return;
    }

    const unitsUsed = currValue - prevValue;
    let unitsPerPeriod = 0;

    switch (readingPeriod) {
      case "Inst":
        unitsPerPeriod = unitsUsed;
        break;
      case "week":
        unitsPerPeriod = unitsUsed / 7;
        break;
      case "month":
        unitsPerPeriod = unitsUsed / 30;
        break;
      default:
        break;
    }

    setUnitsResult(
      `Units consumed per ${readingPeriod}: ${unitsPerPeriod.toFixed(2)}`
    );
  };

  // Calculate units by watt-hour
  const calculateUnitsByWattHour = (e) => {
    e.preventDefault();

    const wattValue = parseFloat(watts);
    const hourValue = parseFloat(hours);

    const unitsUsed = (wattValue * hourValue) / 1000; // Convert watt-hours to kWh
    setWattHourResult(`Units consumed: ${unitsUsed.toFixed(2)} kWh`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Calculation</h1>

      {/* Fetch Readings Form */}
      <form onSubmit={fetchReadings} className="space-y-4">
        <h2 className="text-xl font-bold">Units Used from Date to Date</h2>
        <label htmlFor="searchMeterId" className="block font-medium">
          Meter ID:
        </label>
        <input
          type="text"
          id="searchMeterId"
          value={searchMeterId}
          onChange={(e) => setSearchMeterId(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {readings.length > 0 && (
        <form onSubmit={calculateUnitsUsedFromDateRange} className="space-y-4 mt-4">
          <label htmlFor="fromReading" className="block font-medium">
            From:
          </label>
          <select
            id="fromReading"
            value={fromReading}
            onChange={(e) => setFromReading(e.target.value)}
            required
            className="border p-2 rounded w-full"
          >
            {readings.map((reading, index) => (
              <option key={index} value={reading.reading}>
                {reading.readingDate}: {reading.reading}
              </option>
            ))}
          </select>

          <label htmlFor="toReading" className="block font-medium">
            To:
          </label>
          <select
            id="toReading"
            value={toReading}
            onChange={(e) => setToReading(e.target.value)}
            required
            className="border p-2 rounded w-full"
          >
            {readings.map((reading, index) => (
              <option key={index} value={reading.reading}>
                {reading.readingDate}: {reading.reading}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Calculate
          </button>
        </form>
      )}
      {dateRangeResult && <p className="text-lg text-green-600 mt-4">{dateRangeResult}</p>}

      {/* Units Consumption Form */}
      <form onSubmit={calculateUnits} className="space-y-4 mt-8">
        <h2 className="text-xl font-bold">Units Consumption Per Day & Total Units</h2>
        <label htmlFor="prevReading" className="block font-medium">
          Previous Reading:
        </label>
        <input
          type="number"
          id="prevReading"
          value={prevReading}
          onChange={(e) => setPrevReading(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
        <label htmlFor="currReading" className="block font-medium">
          Current Reading:
        </label>
        <input
          type="number"
          id="currReading"
          value={currReading}
          onChange={(e) => setCurrReading(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
        <label htmlFor="readingPeriod" className="block font-medium">
          Reading Period:
        </label>
        <select
          id="readingPeriod"
          value={readingPeriod}
          onChange={(e) => setReadingPeriod(e.target.value)}
          required
          className="border p-2 rounded w-full"
        >
          <option value="Inst">Inst</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Calculate
        </button>
      </form>
      {unitsResult && <p className="text-lg text-green-600 mt-4">{unitsResult}</p>}

      {/* Watt-Hour Calculation Form */}
      <form onSubmit={calculateUnitsByWattHour} className="space-y-4 mt-8">
        <h2 className="text-xl font-bold">Units by Watt * Hour</h2>
        <label htmlFor="watts" className="block font-medium">
          Watts:
        </label>
        <input
          type="number"
          id="watts"
          value={watts}
          onChange={(e) => setWatts(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
        <label htmlFor="hours" className="block font-medium">
          Hours:
        </label>
        <input
          type="number"
          id="hours"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Calculate
        </button>
      </form>
      {wattHourResult && (
        <p className="text-lg text-green-600 mt-4">{wattHourResult}</p>
      )}
    </div>
  );
};

export default Cal;
