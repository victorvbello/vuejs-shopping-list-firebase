var config = {
    apiKey: "AIzaSyAVPWuEqW_WX6DqjyShp-EFbZRpT3yVTxg",
    authDomain: "shopping-list-vue.firebaseapp.com",
    databaseURL: "https://shopping-list-vue.firebaseio.com",
    projectId: "shopping-list-vue",
    storageBucket: "shopping-list-vue.appspot.com",
    messagingSenderId: "115565964535"
  };
firebase.initializeApp(config);

var db=firebase.database(),
		ref=db.ref('items/'),
		auth=firebase.auth(),
		googleProvider=new firebase.auth.GoogleAuthProvider();


Vue.component('addItem',{
	template:'#add-item',
	data:function(){
		return {
			item:{
				_id:'',
				name:'',
				type:0,
				acount:0,
				date:'',
				completed:false
			},
			alert:{
				type:null,
				msg:null
			},
			isNew:true
		};
	},
	props:['types','date','saveFunction','itemEdit'],
	methods:{
		showAlert(type,msg){
			var self=this;
			this.alert={
				type:'alert-'+type,
				msg:msg
			};
			setTimeout(function(){
				self.alert={
					type:null,
					msg:null
				};
			},2000)
		},
		saveItem:function(){
			var data=this.item;
			var self=this;
			data.date=this.date;
			if(data.name!='' && data.acount>0){
				var key=(!this.isNew)?data._id:null
				this.saveFunction(data,key)
				.then(function(){
					self.item={
						_id:'',
						name:'',
						type:0,
						acount:0,
						date:'',
						completed:false
					};
					self.isNew=true;
					self.showAlert('success','Item guardado con exito');
				})
				.catch(function(){
					self.showAlert('danger','Error al guardar el item');
				})
			}else{
				this.showAlert('danger','Debe ingresar, el nombre y la cantidad de items');
			}
		},
	},
	watch:{
		itemEdit:{
			handler:function(newData, oldData){
				this.item._id=newData._id;
				this.item.name=newData.name;
				this.item.type=newData.type;
				this.item.acount=newData.acount;
				this.isNew=false;
			}
		}
	}
});

Vue.component('itemList',{
	template:'#item-list',
	created:function(){
		this.dateList=this.date;
		this.typeList=this.types;
		var self=this;
		this.cargando=true;
		ref.on('value',function(snapshot){
			var dbItems=snapshot.val();
			self.itemsList=[];
			for ( var key in dbItems){
				var element={
					_id:key,
					name:dbItems[key].name,
					type:dbItems[key].type,
					acount:dbItems[key].acount,
					date:dbItems[key].date,
					completed:dbItems[key].completed,
					user:dbItems[key].user
				}
				self.itemsList.unshift(element);
			}
			self.cargando=false;
		})
	},
	data:function(){
		return {
			dateList:'',
			nameItem:'',
			itemsList:[],
			typeList:[],
			cargando:false
		};
	},
	props:['types','date','userLogin'],
	computed:{
		filterList:function(){
			var self = this
			return self.itemsList.filter(function(item){
				var result=true;
				if(self.dateList!='')result=(new Date(item.date).getTime()==new Date(self.dateList).getTime());
				if(self.nameItem!='')result=(item.name.toLowerCase().indexOf(self.nameItem.toLowerCase())!=-1);
				return result 
			})
		}
	},
	methods:{
		editItem:function(item){
			this.$emit('update-item',item);
		},
		checkItem:function(status,item){
			var event={status,item};
			this.$emit('complete-item',event);
		},
		deleteItem:function(item){
			this.$emit('delete-item',item);
		}
	}
});

var vm =new Vue({
	el:'#app-vue',
	created:function(){
		this.today=this.getFormatDate(new Date());
		this.checkStateAuth();
	},
	data:{
		isLogin:false,
		today:'',
		itemEdit:{},
		typesOfItems:[
				'Comida',
				'Aseo',
				'Entretenimiento'
			],
		user:{
			id:null,
			name:null,
			email:null,
			photo:null
		}
	},
	methods:{
		checkStateAuth:function(){
			auth.onAuthStateChanged(function(user){
				if(user){
					vm.isLogin=true;
					vm.user={
						id:user.uid,
		  			name:user.displayName,
						email:user.email,
						photo:user.photoURL
		  		};
				}else{
					vm.isLogin=false;
					vm.user={
						id:null,
						name:null,
						email:null,
						photo:null
					};
				}
			})
		},
		userLogin:function(){
			auth.signInWithPopup(googleProvider).catch(function(error) {
		  	console.error('Error al iniciar sesión',error);
			});
		},
		userLogout:function(){
			auth.signOut().catch(function(error){
				console.error('Error al cerrar sesión',error);
			});
		},
		getFormatDate:function(date){
			var day = date.getDate(),
	  			month = date.getMonth()+1,
	  			year = date.getFullYear(),
			day=((day<10)?'0'+day:day);
			month=((month<10)?'0'+month:month);
			return {es:day+'/'+month+'/'+year,en:year+'-'+month+'-'+day};
		},
		saveItem:function(item,key){
			if(key!=null){
				return db.ref('items/'+key).update({
					name:item.name,
					type:item.type,
					acount:item.acount,
					date:item.date,
					completed:item.completed
				});
			}else{
				return ref.push({
					name:item.name,
					type:item.type,
					acount:item.acount,
					date:item.date,
					completed:item.completed,
					user:vm.user
				});
			}
		},
		updateItem:function(item){
			this.itemEdit=item;
		},
		completeItem:function(event){
			var status=event.status,
					item=event.item;
			item.completed=status;
			return db.ref('items/'+item._id).update({
				completed:item.completed
			});
		},
		removeItem:function(item){
			return db.ref('items/'+item._id).remove();
		}
	},
});
