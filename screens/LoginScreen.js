import React from 'react';
import {Text,View,StyleSheet,Image,TouchableOpacity,KeyboardAvoidingView,Alert,TextInput} from 'react-native';
import * as firebase from 'firebase';
export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state={
            emailID:'',
            password:'',

        }
    }
    login = async(email,password) =>{
    if(email && password){
     try{
         const response = await firebase.auth().signInWithEmailAndPassword(email,password)
         if(response){
             this.props.navigation.navigate('Transactions')
         }
     }
     catch(error){
         switch(error.code){
             case 'auth/user-not-found':
                 Alert.alert('User Does Not Exist')
                 break;
             case 'auth/invalid-emailID':
                 Alert.alert('Incorrect Email Or Password')
                 break;

         }
     }
    }
    else{
        Alert.alert('Enter Email And Password')
    }
    }
    render(){
        return(
            <KeyboardAvoidingView style={{alignItems:'center',marginTop:20,}} >
            <View>
            <Image source={require("../assets/booklogo.jpg")}
            style={{width:200,height:200}} />
            <Text style={{textAlign:'center',fontSize:30}}>Wily</Text>

            
            </View>
            <View>
                <TextInput style={styles.loginBox}                 
                placeholder = 'abc@example.com' 
                keyboardType = 'email-address'
                onChangeText = {(text)=>{
                    this.setState({emailID:text})
                }} />
            </View>
            <View>
                <TextInput style={styles.loginBox} 
                secureTextEntry={true}
                placeholder = 'Enter Password' 
               
                onChangeText = {(text)=>{
                    this.setState({password:text})
                }} />
            </View>
            <View>
                <TouchableOpacity style={{height:50,width:100,borderWidth:1,marginTop:20,borderRadius:7,paddingTop:5,marginLeft:15}}
                onPress = {()=>{
                    this.login(this.state.emailID,this.state.password)
                }}>
                <Text style={{textAlign:'center',fontSize:20}}>Login</Text>
                </TouchableOpacity>
            </View>
            </KeyboardAvoidingView>
        )
    }
} 
const styles = StyleSheet.create({
    loginBox:{
        width:300,
        height:40,
        borderWidth:1.5,
        fontSize:20,
        margin:10,
        marginLeft:40,
      
        padding:10,
    }
})
