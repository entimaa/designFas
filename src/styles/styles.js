import { StyleSheet,Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export  const styles = StyleSheet.create({
    container: {
      flex: 2,
      padding:16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:'#AA98A9',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#fff', // Change the text color to white
    },
     registerOptionLoginScreen:
 {
  justifyContent: 'center',
      flexDirection: 'row',
      width: '100%',
      height: '6%',
 },
    input: {
      paddingTop:20,
      paddingBottom:10,
      width:225,
      fontSize:20,
      borderBottomWidth:1,
      borderBottomColor:'#000',
      marginBottom:10,
      textAlign:'center'
    },
    errorText: {
      color: 'red',
      marginBottom: 10,
    },
    loginButton:{
      height: 35,
          width: '75%',
          backgroundColor: '#584858',
          borderRadius: 10,
          marginTop: '5%',
          marginRight:'5%',
          justifyContent: 'center',
          alignSelf: 'center',
     },
    loginButtonText:{
      color: '#fff',
      alignSelf: 'center',
      fontSize: 18,
    },
    loginText: {
      marginTop: 5,
      color: '#fff', // Change the text color to white
      textDecorationLine: 'underline',
      textAlign: 'center',
     fontSize: 14,
     
    
    },
    imagest:{
      backgroundColor: '#74C365',
      position: 'absolute',
      left: 0,
      right: 0,
      justifyContent: 'center',
      top: '2%',
      margin:30
     },
      item: {
      flex: 1,
      margin: 4,
      
    },
    image: {
      width: width * 0.7,
      height: width * 0.9,
      resizeMode: 'cover',
      
    },
    radioText:{
      fontSize:15
    },
    radio:{
      height:25,
      width:25,
      borderColor:'#584858',
      borderWidth:2,
      borderRadius:20,
      margin:10
    },
    radioMain:{
      flexDirection:'row',
      alignItems: 'center',
      padding:1,
      
      

    },
    radioDot:{
      backgroundColor:'#584858',
      height:17,
      width:17,
      borderRadius:30,
      margin:2//dot in redio
    },
    loginButton:{
      height: 40, // زيادة ارتفاع المربع
      width: '67%', // تحديد عرض المربع بنسبة مئوية من العرض الكلي للشاشة
      backgroundColor: '#584858', // تغيير لون الخلفية إلى اللون البرتقالي
      borderRadius: 18, // زيادة قوس الزاوية لجعل المربع أكثر دائرية
      justifyContent: 'center', // محاذاة النص في الوسط عمودياً
      alignItems: 'center', // محاذاة النص في الوسط أفقياً
      
    
     },
  });