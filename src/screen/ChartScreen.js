import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import fetchAndProcessData from './fetchAndProcessData';

const ChartScreen = ({ route }) => {
  const { userId, username } = route.params || {};

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        const data = await fetchAndProcessData(userId);
        console.log('Fetched chart data:', data);
        setChartData(data);
      } catch (error) {
        console.error('Failed to load chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#3498db" />;
  }

  if (!username || !userId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: '#e74c3c' }}>Failed to load data. Please try again later.</Text>
      </View>
    );
  }

  // Prepare data for the bar chart
  const data = {
    labels: chartData.map(item => {
      const date = new Date(item.date);
      // Format labels to show only the day of the week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [
      {
        data: chartData.map(item => parseFloat(item.percentage)),
        colors: chartData.map(() => (opacity = 1) =>
          `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${opacity})`
        ),
      },
    ],
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#e9d8fd' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 16 }}>{username}</Text>
      <Text style={{ fontSize: 18, color: '#7f8c8d', marginBottom: 24 }}>Visit percentages for the week</Text>
      <BarChart
        data={data}
        width={Dimensions.get('window').width - 32}
        height={300}
        yAxisSuffix="%"
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#2980b9',
          backgroundGradientTo: '#8e44ad',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
            padding: 10,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#e74c3c',
          },
        }}
        verticalLabelRotation={0} //! Keep labels
        showValuesOnTopOfBars // !Show values on top of bars
        fromZero //! Start the y- from zero
        withInnerLines={false} //! Remove grid lines for a cleaner look
        style={{
          marginVertical: 16,
          borderRadius: 16,
          elevation: 5, //!!! Add shadow for a 3D effect
        }}
      />
    </View>
  );
};

export default ChartScreen;
