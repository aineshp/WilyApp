import React from 'react';
import { Text,
   View,
   TouchableOpacity,
   TextInput,
   Image,
   StyleSheet,
  KeyboardAvoidingView ,
ToastAndroid,Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase'
import db from '../config.js'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookID: '',
        scannedStudentID:'',
        buttonState: 'normal',
        transactionMessage: ''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookID: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentID: data,
          buttonState: 'normal'
        });
      }
      
    }

    initiateBookIssue = async()=>{
      //add a transaction
      db.collection("Transactions").add({
        'studentId': this.state.scannedStudentID,
        'bookId' : this.state.scannedBookID,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Issue"
      })
      //change book status
      db.collection("books").doc(this.state.scannedBookID).update({
        'bookAvailability': false
      })
      //change number  of issued books for student
      db.collection("students").doc(this.state.scannedStudentID).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
      })
      this.setState({scannedStudentID:'',
                      scannedBookID:''})
    }

    initiateBookReturn = async()=>{
      //add a transaction
      db.collection("Transactions").add({
        'studentId': this.state.scannedStudentID,
        'bookId' : this.state.scannedBookID,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Return"
      })
      //change book status
      db.collection("books").doc(this.state.scannedBookID).update({
        'bookAvailability': true
      })
      //change number  of issued books for student
      db.collection("students").doc(this.state.scannedStudentID).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
      })
      this.setState({scannedStudentID:'',
                     scannedBookID:''})
    }
    
    checkBookEligibility = async()=>{
      const bookRef = await db.collection("books").where("BookID","==",this.state.scannedBookID).get()
      var transactionType = ""
      if(bookRef.docs.length == 0){
        transactionType = false;
      }
      else{
        bookRef.docs.map((doc)=>{
          var book = doc.data()
          if(book.bookAvailability){
            transactionType =  "issue"
          }
          else{
            transactionType = "return"
          }
        })
      }
      return(
        transactionType
      )
    }
    
    checkStudentEligibilityForBookIssue = async()=>{
      const studentRef = await db.collection("students").where("StudentID","==",this.state.scannedStudentID).get()
      var isStudentEligible = ""
      if(studentRef.docs.length == 0){
        this.setState({scannedStudentID:'',
                        scannedBookID:''})
        isStudentEligible = false;
        Alert.alert("Student ID Is Not In The Database")
      }
      else{
        studentRef.docs.map((doc)=>{
          var student = doc.data()
          if(student.numberOfBooksIssued<2){
            isStudentEligible =  true;
          }
          else{
            isStudentEligible = false;
            Alert.alert("The Student Has Already Issued 2 Books")
            this.setState({scannedBookID:'',
                           scannedStudentID:''})
          }
        })
      }
      return(
        isStudentEligible
      )
    }
    checkStudentEligibilityForReturn = async()=>{
      const transactionRef = await db.collection("Transactions").where("BookID","==",this.state.scannedBookID).limit(1).get()
      var isStudentEligible = ""
      
      transactionRef.docs.map((docs)=>{
          var lastBookTransaction = doc.data();
        if(lastBookTransaction.StudentID === this.state.scannedStudentID){
          isStudentEligible=true;
        }
        else{
          isStudentEligible=false;
          Alert.alert("The Book Was Not Issued By The Student")
          this.setState({scannedBookID:'',
                         scannedStudentID:''})
        }
      
      })
    
      return(
        isStudentEligible
      )
    }
    

    handleTransaction = async()=>{
      var transactionType = await this.checkBookEligibility();
      console.log("transactionType",transactionType)
      if(!transactionType){
        Alert.alert("This Book Does Not Exist In Library Database")
        this.setState({scannedBookID:'',
                       scannedStudentID:''
                      })
      }
      else if(transactionType === "issued"){
        var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
        if(isStudentEligible){
          this.initiateBookIssue()
          Alert.alert("Book Issued To The Student")
        
        }
          }

     
      else{
        var isStudentEligible = await this.checkStudentEligibiltyForReturn()
        if(isStudentEligible){
          this.initiateBookReturn()
          Alert.alert("Book Returned To The Library")
        }
      }
    
    
    }



    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView  style={styles.container} behavior="padding" enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={(text) => {this.setState({scannedBookID:text})}}
              value={this.state.scannedBookID}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>

            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText ={(text) => {this.setState({scannedStudentID:text})}}
              value={this.state.scannedStudentID}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async()=>{
                var transactionMessage = this.handleTransaction();
               
              }}>
          <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: '#FBC02D',
      width: 100,
      height:50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight:"bold",
      color: 'white'
    }
  });