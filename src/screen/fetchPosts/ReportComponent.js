import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

const ReportComponent = () => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [reportText, setReportText] = useState('');

  const handleReportClick = () => {
    setIsInputVisible(true); // Show the input field when the button is clicked
  };

  return (
    <View style={{ padding: 16 }}>
      <Button title="Report" onPress={handleReportClick} />
      
      {isInputVisible && (
        <TextInput
          placeholder="Add your report comment"
          value={reportText}
          onChangeText={setReportText}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            borderRadius: 5,
            marginTop: 16,
          }}
        />
      )}
    </View>
  );
};

export default ReportComponent;
