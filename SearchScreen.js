import React from 'react';
import { Text, View, FlatList, StyleSheet,TextInput,TouchableOpacity } from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import db from '../config';
import { ThemeColors } from 'react-navigation';

export default class Searchscreen extends React.Component {
  constructor(props){
    super(props);
    this.state={
      allTransactions:[],
      lastVisibleTransaction:null,
      search:''

    }
  }
  fetchMoreTransactions = async() =>{
    var text = this.state.search.toUpperCase()
    var enteredText = text.split("")

    if(enteredText [0].toUpperCase()==='B'){
    const query = await db.collection("Transactions").where('BookId','==',text).startAfter(this.state.lastVisibleTransaction).limit().get()
    query.docs.map((doc)=>{
      this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()],
        lastVisibleTransaction:doc
      })
    })
    }
    else if(enteredText [0].toUpperCase()==='S'){
      const query = await db.collection("Transactions").where('StudentId','==',text).startAfter(this.state.lastVisibleTransaction).limit().get()
      query.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc
        })
      })
    }
  }
 
  searchTransactions = async(text) => {
    var enteredText = text.split("")
    if(enteredText [0].toUpperCase()==='B'){
      const transaction = await db.collection("Transactions").where('BookId','==',text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc
        })
      })
    }
    else if(enteredText [0].toUpperCase()==='S'){
      const transaction = await db.collection("Transactions").where('StudentId','==',text).get()
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc
        })
      })
    }
  }
  componentDidMount = async() =>{
    const query = await db.collection("Transactions").limit(10).get()
    query.docs.map((doc)=>{
      this.setState({
        allTransactions:[],
        lastVisibleTransaction:doc
      })
    })
  }
    render() {

      return (
        <View style={styles.container}>
          <View style={styles.searchBar}>
            <TextInput style={styles.bar}
            placeholder="Enter BookId or StudentId"
            onChangeText={(text)=>{
              this.setState({
                search:text
              })
            }}/>
            <TouchableOpacity style={styles.searchButton}
                               onPress={()=>{
                                 this.searchTransactions(this.state.search)
                               }}>
                                 <Text> Search </Text>
                               </TouchableOpacity>
    
          </View>
  
      
        <FlatList
          data={this.state.allTransactions}
          renderItem={({item})=>(
<View  style={{borderBottomWidth:2}}>
                <Text> {"BookID:"+ item.BookId} </Text>
                <Text>{"StudentID:"+ item.StudentId} </Text>
                
                <Text > {"transaction Type:"+ item.transactionType} </Text>
            <Text> {"Date:"+ item.date.toDate() } </Text>
              </View>
          )}
         keyExtractor={(item,index)=>index.toString()  }  
         onEndReached={this.fetchMoreTransactions}
         onEndReachedThreshold={0.75}
 
       />
       </View>
       
      )
       
        }
      }
 const styles = StyleSheet.create({
   container:{
     flex:1,
     marginTop:20,
   },
   searchBar:{
     flexDirection:'row',
     height:80,
     width:'auto',
     borderWidth:0.5,
     alignItems:'center',
     backgroundColor:'skyblue',
     color:'black'
   },
   bar:{
     borderWidth:2,
     height:60,
     width:300,
     paddingLeft:10,
     
   },
   searchButton:{
     borderWidth:1,
     height:60,
     width:70,
     alignItems:'center',
     justifyContent:'center',
     backgroundColor:'yellow',
   }
 })
  