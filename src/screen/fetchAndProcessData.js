import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../data/DataFirebase'; 
import { startOfWeek, endOfWeek, isWithinInterval, format,  } from 'date-fns';//!!כדי לחשב את אחוז הביקורים עבור כל יום במהלך השבוע הנוכחי

//! -->> THIS JUST TO USER DESIGNER >>--
/*
//*startOfWeek: --->>  لحساب بداية الأسبوع بناءً على التاريخ الحالي.
//*endOfWeek:---> لحساب نهاية الأسبوع بناءً على التاريخ  الحالي.
//*isWithinInterval: ---->>للتحقق مما إذا كانت زيارة معينة تقع ضمن نطاق الأسبوع الحالي.
//*format:---->  لتحويل الكائنات Date إلى تنسيق yyyy-MM-dd.
*/

const fetchAndProcessData = async (userId) => {
  const userRef = doc(db, 'userDesigner', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error('User data not found');
  }

  const { visitDates } = userDoc.data();
  //!visitDates מופק מנתוני משתמש. אם אין ביקורים, הנתונים היומיים מאתחלים באפס ביקורים.
  if (!visitDates || visitDates.length === 0) {
    const now = new Date();

    
    //! يتم حساب بداية الأسبوع الحالي باستخدام startOfWeek.
    //!!يتم إنشاء كائن dailyData الذي يحتوي على تواريخ الأسبوع الحالي مع تعيين عدد الزيارات لكل يوم بصفر. 

    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 0 }); // !Sunday start-->> the week
    const dailyData = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfCurrentWeek);
      date.setDate(date.getDate() + i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      dailyData[formattedDate] = { totalVisits: 0 }; // !!--> with zero visits
    }

    // Return zero percentage for all days
    /**
     * معالجة البيانات اليومية عندما لا تكون هناك زيارات أو عندما تكون بيانات الزيارات فارغة. يتم تنفيذ ذلك من خلال 
     * إنشاء كائن يحتوي على تواريخ الأسبوع الحالي وجعل نسبة الزيارات اليومية "0.00" نظرًا لعدم وجود زيارات.
     */
    const processedData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      percentage: '0.00',
    }));

    return processedData;
  }

  //?? Get the current week range
  const now = new Date();
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 0 }); // Sunday start  week
  const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 0 }); // Sunday end week
  console.log('Start of week:', startOfCurrentWeek);
  console.log('End of week:', endOfCurrentWeek);

  // !Filter visits within the current week
  //!يتم تصفية الزيارات لإظهار تلك التي حدثت فقط خلال الأسبوع الحالي باستخدام isWithinInterval.
  const filteredVisits = visitDates.filter(({ timestamp }) => {
    const visitDate = timestamp.toDate();
    return isWithinInterval(visitDate, { start: startOfCurrentWeek, end: endOfCurrentWeek });
  });
  console.log('Visits:', filteredVisits);

  // !!Group visits --<< day
  const dailyData = {};
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfCurrentWeek);
    date.setDate(date.getDate() + i);
    const formattedDate = format(date, 'yyyy-MM-dd');
    dailyData[formattedDate] = { totalVisits: 0 }; //! with zero visit
  }

//!!يتم زيادة عدد الزيارات اليومية بناءً على الزيارات المفلترة.
  filteredVisits.forEach(({ timestamp }) => {
    const date = format(timestamp.toDate(), 'yyyy-MM-dd');
    if (dailyData[date]) {
      dailyData[date].totalVisits++;
    }
  });

  console.log('DailyDATTTA------->>>:', dailyData);

  // TODO-->>Calculate total visits for the week
  //!تم جمع إجمالي عدد الزيارات للأسبوع.
  const totalVisitsForWeek = Object.values(dailyData).reduce((acc, data) => acc + data.totalVisits, 0);

  console.log('Total Visits Week:', totalVisitsForWeek);

  //! Calculate percentages אחוזים--->>
  //!!حساب النسب المئوية للزيارات اليومية:
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
