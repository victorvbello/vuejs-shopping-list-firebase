Vue.component('addItem',{
	template:'#add-item',
	data:function(){
		return {
			item:{
				name:'',
				type:0,
				acount:0,
				date:'',
				completed:false
			},
			isNew:true
		};
	},
	props:['types','date','saveFunction','itemEdit'],
	methods:{
		saveItem:function(){
			var data=this.item;
			data.date=this.date;
			if(data.name!='' && data.acount>0){
				this.saveFunction(data);
			}else{
				alert('Debe ingresar, el nombre y la cantidad de items');
			}
		},
	},
	watch:{
		itemEdit:{
			handler:function(newData, oldData){
				this.item.name=newData.name;
				this.item.type=newData.type;
				this.item.acount=newData.acount;
			}
		}
	}
});

Vue.component('itemList',{
	template:'#item-list',
	created:function(){
		this.dateList=this.date;
		this.itemsList=this.items;
		this.typeList=this.types;
	},
	data:function(){
		return {
			styles:{
				through:{
					'text-decoration':'line-through',
					}
			},
			dateList:'',
			nameItem:'',
			itemsList:[],
			typeList:[]
		};
	},
	props:['types','date','items','options'],
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
			this.$emit('update-item',item)
		},
		checkItem:function(item){
			this.$emit('complete-item',item)
		},
		deleteItem:function(item){
			this.$emit('delete-item',item)
		}
	}
});

new Vue({
	el:'#app-vue',
	created:function(){
		this.today=this.getFormatDate(new Date());
	},
	data:{
		today:'',
		itemEdit:{},
		items:[
			{
				name:'Pan',
				type:0,
				acount:2,
				date:'2017-07-07',
				completed:false
			},
			{
				name:'Pasta de Dientes',
				type:1,
				acount:1,
				date:'2017-07-07',
				completed:false
			}
		],
		typesOfItems:[
				'Comida',
				'Aseo',
				'Entretenimiento'
			]
	},
	methods:{
		getFormatDate:function(date){
			var day = date.getDate();
	  	var month = date.getMonth()+1;
	  	var year = date.getFullYear();
			day=((day<10)?'0'+day:day);
			month=((month<10)?'0'+month:month);
			return {es:day+'/'+month+'/'+year,en:year+'-'+month+'-'+day};
		},
		saveItem:function(item){
			this.items.unshift(item);
		},
		updateItem:function(item){
			this.itemEdit=item;
		},
		completeItem:function(item){
			item.completed=true;
		},
		removeItem:function(index){
			this.items.splice(index,1);
		}
	},
});
