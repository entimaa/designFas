import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DFD3C3',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#603F26',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
    borderWidth: 0.7,
    borderColor: 'black',
  },
  formContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: '#DFD3C3',
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70//!covvven
    ,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 17,
  },
  inputLabel: {
    fontSize: 16,
    color: '#603F26',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 25,
    borderColor: '#fff',
    borderWidth: 1,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  loginButtonCustom: {
    height: 50,
    width: '100%',
    backgroundColor: '#603F26',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonTextC: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 10,
    color: '#603F26',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 15,
    height: 24,
    width: 24,
  },
  eyeImage: {
    height: '100%',
    width: '100%',
  },
});
