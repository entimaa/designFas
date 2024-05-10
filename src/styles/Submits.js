import { StyleSheet } from "react-native";
export  const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 20
      },
      image: {
        width: 200,
        height: 200,
        marginVertical: 10,
        alignSelf: 'center'
      },
    InputWrapper:{
        flex:1,
       justifyContent:'center',
       alignItems:'stretchh',
    background:'#2e64e515'
       
    },
    InputField:{
        justifyContent:'center',
        alignItems:'center',
        fontFamily:'',
        fontSize:'24',
        width:'90%',
        marginBottom:'15px'
    },
    SubmitBtn:{
        flexDirection:'row',
        justifyContent  :'center',
        backgroundColor:'#1E4',
        borderRadius:'5px',
        padding:'10px 25px'   

    }
});



/**
 * khllk
 * 


export const AddImage = styled.Image`
    width: 100%;
    height: 250px;
    margin-bottom: 15px;
`;

export const StatusWrapper = styled.View`
    justify-content: center;
    align-items: center;
`;


export const SubmitBtnText = styled.Text`
    font-size: 18px;
    font-family: 'Lato-Bold';
    font-weight: bold;
    color: #2e64e5;
`;

 */