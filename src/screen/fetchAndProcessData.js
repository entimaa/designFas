import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../data/DataFirebase'; // Adjust path to your Firebase config
import { startOfWeek, endOfWeek, isWithinInterval, format, parseISO } from 'date-fns';

const fetchAndProcessData = async (userId) => {
  const userRef = doc(db, 'userDesigner', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error('User data not found');
  }

  const { visitDates } = userDoc.data();
  if (!visitDates || visitDates.length === 0) {
    // Initialize the daily data with zero visits
    const now = new Date();
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 0 }); // Sunday start of the week
    const dailyData = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfCurrentWeek);
      date.setDate(date.getDate() + i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      dailyData[formattedDate] = { totalVisits: 0 }; // Initialize with zero visits
    }

    // Return zero percentage for all days
    const processedData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      percentage: '0.00',
    }));

    return processedData;
  }

  // Get the current week range
  const now = new Date();
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 0 }); // Sunday start of the week
  const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 0 }); // Sunday end of the week

  console.log('Start of week:', startOfCurrentWeek);
  console.log('End of week:', endOfCurrentWeek);

  // Filter visits within the current week
  const filteredVisits = visitDates.filter(({ timestamp }) => {
    const visitDate = timestamp.toDate();
    return isWithinInterval(visitDate, { start: startOfCurrentWeek, end: endOfCurrentWeek });
  });

  console.log('Filtered Visits:', filteredVisits);

  // Group visits by day
  const dailyData = {};
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfCurrentWeek);
    date.setDate(date.getDate() + i);
    const formattedDate = format(date, 'yyyy-MM-dd');
    dailyData[formattedDate] = { totalVisits: 0 }; // Initialize with zero visits
  }

  filteredVisits.forEach(({ timestamp }) => {
    const date = format(timestamp.toDate(), 'yyyy-MM-dd');
    if (dailyData[date]) {
      dailyData[date].totalVisits++;
    }
  });

  console.log('Daily Data:', dailyData);

  // Calculate total visits for the week
  const totalVisitsForWeek = Object.values(dailyData).reduce((acc, data) => acc + data.totalVisits, 0);

  console.log('Total Visits for Week:', totalVisitsForWeek);

  // Calculate percentages
  const processedData = Object.entries(dailyData).map(([date, data]) => {
    const totalVisits = data.totalVisits;
    const visitorPercentages = {
      date,
      percentage: totalVisitsForWeek > 0 ? ((totalVisits / totalVisitsForWeek) * 100).toFixed(2) : '0.00',
    };

    return visitorPercentages;
  });

  console.log('Processed Data:', processedData);

  return processedData;
};

export default fetchAndProcessData;
