import React from 'react';
import { View, Text, Button, StyleSheet ,SafeAreaView,ScrollView,TouchableOpacity,Image,contentContainerStyle} from 'react-native';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, signOutUser } = useAuth();

  const handleLogout = async () => {
    await signOutUser();
  };

  return (
    
    <View style={styles.container}>
      <SafeAreaView style={{flex:1,backgroundColor:'#fff'}}>
        <ScrollView 
        style={styles.container}
     
        >
            <Image style={styles.ImageUser} source={require('../pic/des1.png')}/>
            <Text style={styles.UserName}>{user.email}</Text>
            {user ? (
        <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
      ) : (
        <Text style={styles.welcomeText}>Welcome</Text>
      )}
            <View style={styles.userBtn}>
                <TouchableOpacity style={styles.userButton} onPress={() => {}} >
                    <Text style={styles.userbuttontext}>Massege</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.userButton} onPress={() => {}} >
                    <Text style={styles.userbuttontext}>Follow</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.userBtn}>
                <View style={styles.userInfoWItems}>
                    <Text >22</Text>
                    <Text>Post</Text>
                </View>

                <View style={styles.userInfoWItems}>
                    <Text style={styles.userInfoWItems}>10,000</Text>
                    <Text style={styles.userInfoWItems}>Followers</Text>
                </View>

                <View>
                    <Text style={styles.userInfoWItems}>100</Text>
                    <Text style={styles.userInfoWItems}>following</Text>
                </View>


            </View>

        </ScrollView>
    </SafeAreaView>
      {user ? (
        <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
      ) : (
        <Text style={styles.welcomeText}>Welcome</Text>
      )}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container :{
    flex:1,
    backgroundColor: '#fff',
    padding:20
    
},
ImageUser:{
    height:160,
    width:160,
    borderRadius:89
},
UserName :{
    fontSize: 20,
    fontWeight:'bold',
    marginTop:10,
    marginBottom:10,

},
userBtn:{
    flexDirection:"row",
    justifyContent:'space-around',
    width:'70%',//بتحكم في المسافه بين المربعين للمتابعين وال الرسال:
    marginVertical:20

},
userButton:{
    borderColor:'#2e64e4',
    borderRadius:15,
    borderWidth:2,
    paddingVertical:8,
    paddingHorizontal:12,
    marginHorizontal:8

},
userbuttontext:{
    color:'#2e64e4'
},
 userInfoW:{
   

 },
 userInfoWItems:{
    
    justifyContent:'center',


 },
 userinfoT:{
    fontSize:20,
    fontWeight:'bold',
    marginBottom:5,
    textAlign:'center',

 }
});

export default Home;
