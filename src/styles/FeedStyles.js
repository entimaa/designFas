import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export const styles = StyleSheet.create({
  container: {
    flex: 1,
   // justifyContent: 'center',// in center -- all 
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  card: {
    backgroundColor: '#f8f8',
    width: width - 30, // Adjust width to be responsive
    marginBottom: 20,
    borderRadius: 10,
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userText: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 7,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: '', // Add a font family if required
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },

  postText :{
    fontSize: 14 ,
    paddingLeft:15,
    paddingRight:15,

  },
  postaimage:{
    width: '100%', // Set the width to fill its container
    height: 300,   // Set a fixed height of 300
    marginTop: 15,


  }, 
  Line:{
    marginTop:10,
    width: 330,
    borderWidth: 0.3,
    borderColor: '#303',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf:'center',
    backgroundColor: '#fff',

  },
  Icon :{
    flexDirection: 'row',
    justifyContent:'space-around',
    padding:10
  },
  iconLike :{
    flexDirection:'row',
    justifyContent:'center',
    borderRadius:5,
  
    

  },
  iconText:{
    fontSize:12,
    fontWeight:'bold',
    color:'#333',
    
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 6,
  },
  iconButton: {
    flexDirection: 'row',
    backgroundColor:'#88f8',
    alignItems: 'center',
    borderWidth: 0.2,
    borderColor: '#000',  // Border color, you can customize it
    borderRadius: 5,
    padding: 4,
    margin:7,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Changed background color
    paddingVertical: 10, // Added padding top and bottom
  },
  listContent: {
    paddingHorizontal: 16, // Added horizontal padding
    paddingTop: 10, // Added top padding
    paddingBottom: 20,
  },
});
